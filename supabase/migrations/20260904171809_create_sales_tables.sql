-- ============================================================
-- Migration: create_sales_tables
-- Creates: sales, sale_items
-- Rules:
--   - Cash → customer_id can be NULL
--   - Credit → customer_id IS NOT NULL (enforced by CHECK)
--   - Due = total_amount - received_amount (derived, never stored)
--   - RLS: business_id isolation (multi-tenant, AGENTS.md Rule 11)
--   - Monetary columns use NUMERIC(12,2) (AGENTS.md Rule 33)
-- ============================================================

-- --------------------------------------------------------
-- SALES TABLE
-- --------------------------------------------------------
CREATE TABLE public.sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

    -- customer_id: NULL is allowed for cash sales.
    -- Will FK to parties table once it exists.
    customer_id     UUID,

    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (received_amount >= 0),

    -- Allowed payment types. Extend as needed.
    payment_type    TEXT NOT NULL CHECK (payment_type IN (''cash'', ''credit'', ''online'', ''cheque'')),

    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Business rule: credit sale → customer required
    CONSTRAINT credit_requires_customer CHECK (
        payment_type != ''credit'' OR customer_id IS NOT NULL
    ),

    -- Guard: received cannot exceed total
    CONSTRAINT received_not_exceed_total CHECK (
        received_amount <= total_amount
    )
);

-- --------------------------------------------------------
-- SALE_ITEMS TABLE
-- --------------------------------------------------------
CREATE TABLE public.sale_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id         UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,

    -- item_id: snapshot reference. Will FK to items table once it exists.
    item_id         UUID,

    -- Snapshot of item name at time of sale (preserves history if item is renamed)
    item_name       TEXT NOT NULL,

    quantity        NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (AGENTS.md Rule 11)
-- --------------------------------------------------------
ALTER TABLE public.sales      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- INDEXES
-- --------------------------------------------------------
CREATE INDEX idx_sales_business_id
    ON public.sales (business_id);

CREATE INDEX idx_sales_business_created
    ON public.sales (business_id, created_at DESC, id DESC);

CREATE INDEX idx_sales_customer_id
    ON public.sales (customer_id)
    WHERE customer_id IS NOT NULL;

CREATE INDEX idx_sale_items_sale_id
    ON public.sale_items (sale_id);

-- --------------------------------------------------------
-- RLS POLICIES: sales
-- --------------------------------------------------------
CREATE POLICY "Business members can read own sales"
    ON public.sales FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM public.users WHERE id = public.firebase_uid()
        )
    );

CREATE POLICY "Business members can insert own sales"
    ON public.sales FOR INSERT
    WITH CHECK (
        business_id IN (
            SELECT business_id FROM public.users WHERE id = public.firebase_uid()
        )
    );

CREATE POLICY "Business members can update own sales"
    ON public.sales FOR UPDATE
    USING (
        business_id IN (
            SELECT business_id FROM public.users WHERE id = public.firebase_uid()
        )
    );

CREATE POLICY "Business members can delete own sales"
    ON public.sales FOR DELETE
    USING (
        business_id IN (
            SELECT business_id FROM public.users WHERE id = public.firebase_uid()
        )
    );

-- --------------------------------------------------------
-- RLS POLICIES: sale_items
-- --------------------------------------------------------
CREATE POLICY "Business members can read own sale_items"
    ON public.sale_items FOR SELECT
    USING (
        sale_id IN (
            SELECT id FROM public.sales
            WHERE business_id IN (
                SELECT business_id FROM public.users WHERE id = public.firebase_uid()
            )
        )
    );

CREATE POLICY "Business members can insert own sale_items"
    ON public.sale_items FOR INSERT
    WITH CHECK (
        sale_id IN (
            SELECT id FROM public.sales
            WHERE business_id IN (
                SELECT business_id FROM public.users WHERE id = public.firebase_uid()
            )
        )
    );

CREATE POLICY "Business members can update own sale_items"
    ON public.sale_items FOR UPDATE
    USING (
        sale_id IN (
            SELECT id FROM public.sales
            WHERE business_id IN (
                SELECT business_id FROM public.users WHERE id = public.firebase_uid()
            )
        )
    );

CREATE POLICY "Business members can delete own sale_items"
    ON public.sale_items FOR DELETE
    USING (
        sale_id IN (
            SELECT id FROM public.sales
            WHERE business_id IN (
                SELECT business_id FROM public.users WHERE id = public.firebase_uid()
            )
        )
    );
