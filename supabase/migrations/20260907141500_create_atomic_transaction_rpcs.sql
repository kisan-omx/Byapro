-- ================================================================
-- Migration: create_atomic_transaction_rpcs
-- Description: Creates authoritative, tenant-isolated PL/pgSQL transaction
--              RPC functions for all financial operations in Byapro.
-- Rules:
--   - Executes as SECURITY INVOKER enforcing querying user's RLS policies
--   - Tenant authorization checked via firebase_uid() inside every RPC
--   - Multi-step operations run inside a single PL/pgSQL transaction
--   - Stock movements updated atomically to prevent race conditions
--   - Idempotency & constraint validations enforced
-- ================================================================

-- ---------------------------------------------------------------
-- 1. RECORD SALE TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_sale_transaction(
    p_business_id     UUID,
    p_party_id        UUID DEFAULT NULL,
    p_invoice_number  TEXT DEFAULT NULL,
    p_total_amount    NUMERIC(12,2) DEFAULT 0,
    p_received_amount NUMERIC(12,2) DEFAULT 0,
    p_payment_type    TEXT DEFAULT 'cash',
    p_note            TEXT DEFAULT NULL,
    p_items           JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty NUMERIC(12,3);
    v_unit_price NUMERIC(12,2);
    v_discount NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_item_name TEXT;
    v_inv_num TEXT;
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    -- Validations
    IF p_total_amount < 0 THEN
        RAISE EXCEPTION 'total_amount must be >= 0';
    END IF;
    IF p_received_amount < 0 OR p_received_amount > p_total_amount THEN
        RAISE EXCEPTION 'received_amount must be between 0 and total_amount';
    END IF;
    IF p_payment_type NOT IN ('cash', 'credit', 'partial') THEN
        RAISE EXCEPTION 'Invalid payment_type';
    END IF;
    IF (p_payment_type != 'cash' AND p_party_id IS NULL) THEN
        RAISE EXCEPTION 'Party required for credit or partial sales';
    END IF;

    v_inv_num := COALESCE(NULLIF(TRIM(p_invoice_number), ''), 'INV-' || extract(epoch from now())::bigint || '-' || floor(random()*1000)::int);

    -- Idempotency check
    IF EXISTS (
        SELECT 1 FROM public.sales
        WHERE business_id = p_business_id AND invoice_number = v_inv_num
    ) THEN
        SELECT id INTO v_sale_id FROM public.sales
        WHERE business_id = p_business_id AND invoice_number = v_inv_num;
        RETURN v_sale_id;
    END IF;

    -- Insert Sale Record
    INSERT INTO public.sales (
        business_id, party_id, invoice_number, total_amount, received_amount, payment_type, note
    ) VALUES (
        p_business_id, p_party_id, v_inv_num, p_total_amount, p_received_amount, p_payment_type, p_note
    )
    RETURNING id INTO v_sale_id;

    -- Process Line Items & Update Stock
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_item_name  := v_item->>'item_name';
            v_qty        := (v_item->>'quantity')::NUMERIC(12,3);
            v_unit_price := (v_item->>'unit_price')::NUMERIC(12,2);
            v_discount   := COALESCE((v_item->>'discount')::NUMERIC(12,2), 0);
            v_total      := (v_item->>'total_amount')::NUMERIC(12,2);
            
            IF (v_item->>'item_id') IS NOT NULL AND (v_item->>'item_id') != '' THEN
                v_item_id := (v_item->>'item_id')::UUID;
            ELSE
                v_item_id := NULL;
            END IF;

            IF v_qty <= 0 THEN
                RAISE EXCEPTION 'Item quantity must be greater than zero';
            END IF;

            INSERT INTO public.sale_items (
                sale_id, item_id, item_name, quantity, unit_price, discount, total_amount
            ) VALUES (
                v_sale_id, v_item_id, v_item_name, v_qty, v_unit_price, v_discount, v_total
            );

            IF v_item_id IS NOT NULL THEN
                UPDATE public.items
                SET stock_quantity = stock_quantity - v_qty
                WHERE id = v_item_id AND business_id = p_business_id;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Item % not found for business', v_item_id;
                END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN v_sale_id;
END;
$$;

-- ---------------------------------------------------------------
-- 2. RECORD PURCHASE TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_purchase_transaction(
    p_business_id    UUID,
    p_party_id       UUID DEFAULT NULL,
    p_invoice_number TEXT DEFAULT NULL,
    p_total_amount   NUMERIC(12,2) DEFAULT 0,
    p_paid_amount    NUMERIC(12,2) DEFAULT 0,
    p_payment_type   TEXT DEFAULT 'cash',
    p_note           TEXT DEFAULT NULL,
    p_items          JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_purchase_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty NUMERIC(12,3);
    v_unit_price NUMERIC(12,2);
    v_discount NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_item_name TEXT;
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    -- Validations
    IF p_total_amount < 0 THEN
        RAISE EXCEPTION 'total_amount must be >= 0';
    END IF;
    IF p_paid_amount < 0 OR p_paid_amount > p_total_amount THEN
        RAISE EXCEPTION 'paid_amount must be between 0 and total_amount';
    END IF;
    IF p_payment_type NOT IN ('cash', 'credit', 'partial') THEN
        RAISE EXCEPTION 'Invalid payment_type';
    END IF;
    IF (p_payment_type != 'cash' AND p_party_id IS NULL) THEN
        RAISE EXCEPTION 'Party required for credit or partial purchases';
    END IF;

    -- Insert Purchase Record
    INSERT INTO public.purchases (
        business_id, party_id, invoice_number, total_amount, paid_amount, payment_type, note
    ) VALUES (
        p_business_id, p_party_id, NULLIF(TRIM(p_invoice_number), ''), p_total_amount, p_paid_amount, p_payment_type, p_note
    )
    RETURNING id INTO v_purchase_id;

    -- Process Line Items & Increment Inventory
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_item_name  := v_item->>'item_name';
            v_qty        := (v_item->>'quantity')::NUMERIC(12,3);
            v_unit_price := (v_item->>'unit_price')::NUMERIC(12,2);
            v_discount   := COALESCE((v_item->>'discount')::NUMERIC(12,2), 0);
            v_total      := (v_item->>'total_amount')::NUMERIC(12,2);
            
            IF (v_item->>'item_id') IS NOT NULL AND (v_item->>'item_id') != '' THEN
                v_item_id := (v_item->>'item_id')::UUID;
            ELSE
                v_item_id := NULL;
            END IF;

            IF v_qty <= 0 THEN
                RAISE EXCEPTION 'Item quantity must be greater than zero';
            END IF;

            INSERT INTO public.purchase_items (
                purchase_id, item_id, item_name, quantity, unit_price, discount, total_amount
            ) VALUES (
                v_purchase_id, v_item_id, v_item_name, v_qty, v_unit_price, v_discount, v_total
            );

            IF v_item_id IS NOT NULL THEN
                UPDATE public.items
                SET stock_quantity = stock_quantity + v_qty
                WHERE id = v_item_id AND business_id = p_business_id;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Item % not found for business', v_item_id;
                END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN v_purchase_id;
END;
$$;

-- ---------------------------------------------------------------
-- 3. RECORD SALE RETURN TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_sale_return_transaction(
    p_business_id     UUID,
    p_sale_id         UUID DEFAULT NULL,
    p_party_id        UUID DEFAULT NULL,
    p_return_number   TEXT DEFAULT NULL,
    p_total_amount    NUMERIC(12,2) DEFAULT 0,
    p_refunded_amount NUMERIC(12,2) DEFAULT 0,
    p_payment_type    TEXT DEFAULT 'cash',
    p_note            TEXT DEFAULT NULL,
    p_items           JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_return_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty NUMERIC(12,3);
    v_unit_price NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_item_name TEXT;
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    IF p_total_amount < 0 THEN
        RAISE EXCEPTION 'total_amount must be >= 0';
    END IF;
    IF p_refunded_amount < 0 OR p_refunded_amount > p_total_amount THEN
        RAISE EXCEPTION 'refunded_amount must be between 0 and total_amount';
    END IF;

    INSERT INTO public.sale_returns (
        business_id, sale_id, party_id, return_number, total_amount, refunded_amount, payment_type, note
    ) VALUES (
        p_business_id, p_sale_id, p_party_id, NULLIF(TRIM(p_return_number), ''), p_total_amount, p_refunded_amount, p_payment_type, p_note
    )
    RETURNING id INTO v_return_id;

    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_item_name  := v_item->>'item_name';
            v_qty        := (v_item->>'quantity')::NUMERIC(12,3);
            v_unit_price := (v_item->>'unit_price')::NUMERIC(12,2);
            v_total      := (v_item->>'total_amount')::NUMERIC(12,2);
            
            IF (v_item->>'item_id') IS NOT NULL AND (v_item->>'item_id') != '' THEN
                v_item_id := (v_item->>'item_id')::UUID;
            ELSE
                v_item_id := NULL;
            END IF;

            IF v_qty <= 0 THEN
                RAISE EXCEPTION 'Item quantity must be greater than zero';
            END IF;

            INSERT INTO public.sale_return_items (
                sale_return_id, item_id, item_name, quantity, unit_price, total_amount
            ) VALUES (
                v_return_id, v_item_id, v_item_name, v_qty, v_unit_price, v_total
            );

            -- Restore inventory (increment stock)
            IF v_item_id IS NOT NULL THEN
                UPDATE public.items
                SET stock_quantity = stock_quantity + v_qty
                WHERE id = v_item_id AND business_id = p_business_id;
            END IF;
        END LOOP;
    END IF;

    RETURN v_return_id;
END;
$$;

-- ---------------------------------------------------------------
-- 4. RECORD PURCHASE RETURN TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_purchase_return_transaction(
    p_business_id     UUID,
    p_purchase_id     UUID DEFAULT NULL,
    p_party_id        UUID DEFAULT NULL,
    p_return_number   TEXT DEFAULT NULL,
    p_total_amount    NUMERIC(12,2) DEFAULT 0,
    p_refunded_amount NUMERIC(12,2) DEFAULT 0,
    p_payment_type    TEXT DEFAULT 'cash',
    p_note            TEXT DEFAULT NULL,
    p_items           JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_return_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty NUMERIC(12,3);
    v_unit_price NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_item_name TEXT;
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    IF p_total_amount < 0 THEN
        RAISE EXCEPTION 'total_amount must be >= 0';
    END IF;
    IF p_refunded_amount < 0 OR p_refunded_amount > p_total_amount THEN
        RAISE EXCEPTION 'refunded_amount must be between 0 and total_amount';
    END IF;

    INSERT INTO public.purchase_returns (
        business_id, purchase_id, party_id, return_number, total_amount, refunded_amount, payment_type, note
    ) VALUES (
        p_business_id, p_purchase_id, p_party_id, NULLIF(TRIM(p_return_number), ''), p_total_amount, p_refunded_amount, p_payment_type, p_note
    )
    RETURNING id INTO v_return_id;

    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_item_name  := v_item->>'item_name';
            v_qty        := (v_item->>'quantity')::NUMERIC(12,3);
            v_unit_price := (v_item->>'unit_price')::NUMERIC(12,2);
            v_total      := (v_item->>'total_amount')::NUMERIC(12,2);
            
            IF (v_item->>'item_id') IS NOT NULL AND (v_item->>'item_id') != '' THEN
                v_item_id := (v_item->>'item_id')::UUID;
            ELSE
                v_item_id := NULL;
            END IF;

            IF v_qty <= 0 THEN
                RAISE EXCEPTION 'Item quantity must be greater than zero';
            END IF;

            INSERT INTO public.purchase_return_items (
                purchase_return_id, item_id, item_name, quantity, unit_price, total_amount
            ) VALUES (
                v_return_id, v_item_id, v_item_name, v_qty, v_unit_price, v_total
            );

            -- Reduce inventory (decrement stock)
            IF v_item_id IS NOT NULL THEN
                UPDATE public.items
                SET stock_quantity = stock_quantity - v_qty
                WHERE id = v_item_id AND business_id = p_business_id;
            END IF;
        END LOOP;
    END IF;

    RETURN v_return_id;
END;
$$;

-- ---------------------------------------------------------------
-- 5. RECORD PAYMENT IN TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_payment_in_transaction(
    p_business_id    UUID,
    p_party_id       UUID,
    p_amount         NUMERIC(12,2),
    p_payment_method TEXT,
    p_note           TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero';
    END IF;

    INSERT INTO public.payment_in (
        business_id, party_id, amount, payment_method, note
    ) VALUES (
        p_business_id, p_party_id, p_amount, p_payment_method, p_note
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- ---------------------------------------------------------------
-- 6. RECORD PAYMENT OUT TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_payment_out_transaction(
    p_business_id    UUID,
    p_party_id       UUID,
    p_amount         NUMERIC(12,2),
    p_payment_method TEXT,
    p_note           TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero';
    END IF;

    INSERT INTO public.payment_out (
        business_id, party_id, amount, payment_method, note
    ) VALUES (
        p_business_id, p_party_id, p_amount, p_payment_method, p_note
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- ---------------------------------------------------------------
-- 7. RECORD EXPENSE TRANSACTION
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_expense_transaction(
    p_business_id    UUID,
    p_category_id    UUID,
    p_amount         NUMERIC(12,2),
    p_payment_method TEXT,
    p_note           TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = public.firebase_uid() AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized business access';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Expense amount must be greater than zero';
    END IF;

    INSERT INTO public.expenses (
        business_id, category_id, amount, payment_method, note
    ) VALUES (
        p_business_id, p_category_id, p_amount, p_payment_method, p_note
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;
