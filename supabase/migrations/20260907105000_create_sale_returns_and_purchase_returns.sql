-- ================================================================
-- Migration: create_sale_returns_and_purchase_returns
-- Creates: sale_returns, sale_return_items, purchase_returns, purchase_return_items
-- Enforces: RLS multi-tenant security, CHECK constraints, and B-Tree indexes.
-- Updates: public.unified_transactions view with security_invoker = true
-- ================================================================

-- ---------------------------------------------------------------
-- SALE_RETURNS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sale_returns (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sale_id         UUID                   REFERENCES public.sales(id) ON DELETE SET NULL,
    party_id        UUID                   REFERENCES public.parties(id) ON DELETE SET NULL,
    return_number   TEXT,
    total_amount    NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),
    payment_type    TEXT          NOT NULL CHECK (payment_type IN ('cash','credit','partial')),
    note            TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT sale_return_refunded_not_exceed_total CHECK (refunded_amount <= total_amount)
);

-- ---------------------------------------------------------------
-- SALE_RETURN_ITEMS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sale_return_items (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_return_id UUID          NOT NULL REFERENCES public.sale_returns(id) ON DELETE CASCADE,
    item_id        UUID                   REFERENCES public.items(id) ON DELETE SET NULL,
    item_name      TEXT          NOT NULL,
    quantity       NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price     NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_amount   NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- PURCHASE_RETURNS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_returns (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    purchase_id     UUID                   REFERENCES public.purchases(id) ON DELETE SET NULL,
    party_id        UUID                   REFERENCES public.parties(id) ON DELETE SET NULL,
    return_number   TEXT,
    total_amount    NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),
    payment_type    TEXT          NOT NULL CHECK (payment_type IN ('cash','credit','partial')),
    note            TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT purchase_return_refunded_not_exceed_total CHECK (refunded_amount <= total_amount)
);

-- ---------------------------------------------------------------
-- PURCHASE_RETURN_ITEMS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_return_items (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_return_id UUID          NOT NULL REFERENCES public.purchase_returns(id) ON DELETE CASCADE,
    item_id            UUID                   REFERENCES public.items(id) ON DELETE SET NULL,
    item_name          TEXT          NOT NULL,
    quantity           NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price         NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_amount       NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- ENABLE RLS
-- ---------------------------------------------------------------
ALTER TABLE public.sale_returns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_return_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_return_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- RLS POLICIES
-- ---------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sale_returns: read') THEN
        CREATE POLICY "sale_returns: read"   ON public.sale_returns FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "sale_returns: insert" ON public.sale_returns FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "sale_returns: update" ON public.sale_returns FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "sale_returns: delete" ON public.sale_returns FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sale_return_items: read') THEN
        CREATE POLICY "sale_return_items: read"   ON public.sale_return_items FOR SELECT     USING      (sale_return_id IN (SELECT id FROM public.sale_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "sale_return_items: insert" ON public.sale_return_items FOR INSERT     WITH CHECK (sale_return_id IN (SELECT id FROM public.sale_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "sale_return_items: update" ON public.sale_return_items FOR UPDATE     USING      (sale_return_id IN (SELECT id FROM public.sale_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "sale_return_items: delete" ON public.sale_return_items FOR DELETE     USING      (sale_return_id IN (SELECT id FROM public.sale_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'purchase_returns: read') THEN
        CREATE POLICY "purchase_returns: read"   ON public.purchase_returns FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "purchase_returns: insert" ON public.purchase_returns FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "purchase_returns: update" ON public.purchase_returns FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
        CREATE POLICY "purchase_returns: delete" ON public.purchase_returns FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'purchase_return_items: read') THEN
        CREATE POLICY "purchase_return_items: read"   ON public.purchase_return_items FOR SELECT     USING      (purchase_return_id IN (SELECT id FROM public.purchase_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "purchase_return_items: insert" ON public.purchase_return_items FOR INSERT     WITH CHECK (purchase_return_id IN (SELECT id FROM public.purchase_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "purchase_return_items: update" ON public.purchase_return_items FOR UPDATE     USING      (purchase_return_id IN (SELECT id FROM public.purchase_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
        CREATE POLICY "purchase_return_items: delete" ON public.purchase_return_items FOR DELETE     USING      (purchase_return_id IN (SELECT id FROM public.purchase_returns WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
    END IF;
END $$;

-- ---------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sale_returns_business_created ON public.sale_returns (business_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_sale_returns_party_id         ON public.sale_returns (party_id) WHERE party_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sale_return_items_return_id   ON public.sale_return_items (sale_return_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_items_item_id     ON public.sale_return_items (item_id) WHERE item_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_returns_business_created ON public.purchase_returns (business_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_party_id         ON public.purchase_returns (party_id) WHERE party_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchase_return_items_return_id   ON public.purchase_return_items (purchase_return_id);
CREATE INDEX IF NOT EXISTS idx_purchase_return_items_item_id     ON public.purchase_return_items (item_id) WHERE item_id IS NOT NULL;

-- ---------------------------------------------------------------
-- UPDATE UNIFIED_TRANSACTIONS VIEW (including SaleReturn & PurchaseReturn)
-- ---------------------------------------------------------------
CREATE OR REPLACE VIEW public.unified_transactions
WITH (security_invoker = true)
AS
SELECT
    ('sale-' || s.id::text) AS id,
    s.id AS raw_id,
    s.business_id,
    s.party_id,
    COALESCE(p.name, CASE WHEN s.party_id IS NULL THEN 'Cash Sale' ELSE 'Customer' END) AS party_name,
    'Sale'::text AS type,
    COALESCE(
        CASE
            WHEN s.invoice_number IS NOT NULL AND s.invoice_number != '' AND s.invoice_number NOT LIKE 'INV-%'
            THEN (CASE WHEN s.invoice_number LIKE '#%' THEN s.invoice_number ELSE '#' || s.invoice_number END)
            ELSE NULL
        END,
        '#' || (ROW_NUMBER() OVER (PARTITION BY s.business_id ORDER BY s.created_at ASC, s.id ASC))::text
    ) AS index_no,
    s.total_amount,
    (s.total_amount - s.received_amount) AS secondary_amount,
    'Balance'::text AS secondary_label,
    CASE WHEN (s.total_amount - s.received_amount) <= 0 THEN 'Paid' WHEN s.received_amount > 0 THEN 'Partial' ELSE 'Unpaid' END AS status,
    s.note,
    s.payment_type AS payment_method,
    s.created_at
FROM public.sales s
LEFT JOIN public.parties p ON p.id = s.party_id

UNION ALL

SELECT
    ('purchase-' || pur.id::text) AS id,
    pur.id AS raw_id,
    pur.business_id,
    pur.party_id,
    COALESCE(p.name, CASE WHEN pur.party_id IS NULL THEN 'Cash Purchase' ELSE 'Supplier' END) AS party_name,
    'Purchase'::text AS type,
    COALESCE(
        CASE
            WHEN pur.invoice_number IS NOT NULL AND pur.invoice_number != '' AND pur.invoice_number NOT LIKE 'INV-%'
            THEN (CASE WHEN pur.invoice_number LIKE '#%' THEN pur.invoice_number ELSE '#' || pur.invoice_number END)
            ELSE NULL
        END,
        '#' || (ROW_NUMBER() OVER (PARTITION BY pur.business_id ORDER BY pur.created_at ASC, pur.id ASC))::text
    ) AS index_no,
    pur.total_amount,
    (pur.total_amount - pur.paid_amount) AS secondary_amount,
    'Balance'::text AS secondary_label,
    CASE WHEN (pur.total_amount - pur.paid_amount) <= 0 THEN 'Paid' WHEN pur.paid_amount > 0 THEN 'Partial' ELSE 'Unpaid' END AS status,
    pur.note,
    pur.payment_type AS payment_method,
    pur.created_at
FROM public.purchases pur
LEFT JOIN public.parties p ON p.id = pur.party_id

UNION ALL

SELECT
    ('pi-' || pi.id::text) AS id,
    pi.id AS raw_id,
    pi.business_id,
    pi.party_id,
    COALESCE(p.name, 'Party') AS party_name,
    'PaymentIn'::text AS type,
    ('#' || (ROW_NUMBER() OVER (PARTITION BY pi.business_id ORDER BY pi.created_at ASC, pi.id ASC))::text) AS index_no,
    pi.amount AS total_amount,
    pi.amount AS secondary_amount,
    'Unused'::text AS secondary_label,
    'Paid'::text AS status,
    pi.note,
    pi.payment_method,
    pi.created_at
FROM public.payment_in pi
LEFT JOIN public.parties p ON p.id = pi.party_id

UNION ALL

SELECT
    ('po-' || po.id::text) AS id,
    po.id AS raw_id,
    po.business_id,
    po.party_id,
    COALESCE(p.name, 'Party') AS party_name,
    'PaymentOut'::text AS type,
    ('#' || (ROW_NUMBER() OVER (PARTITION BY po.business_id ORDER BY po.created_at ASC, po.id ASC))::text) AS index_no,
    po.amount AS total_amount,
    po.amount AS secondary_amount,
    'Unused'::text AS secondary_label,
    'Paid'::text AS status,
    po.note,
    po.payment_method,
    po.created_at
FROM public.payment_out po
LEFT JOIN public.parties p ON p.id = po.party_id

UNION ALL

SELECT
    ('exp-' || e.id::text) AS id,
    e.id AS raw_id,
    e.business_id,
    NULL::uuid AS party_id,
    COALESCE(ec.name, 'General Expense') AS party_name,
    'Expense'::text AS type,
    ('#' || (ROW_NUMBER() OVER (PARTITION BY e.business_id ORDER BY e.created_at ASC, e.id ASC))::text) AS index_no,
    e.amount AS total_amount,
    e.amount AS secondary_amount,
    'Unused'::text AS secondary_label,
    'Paid'::text AS status,
    e.note,
    e.payment_method,
    e.created_at
FROM public.expenses e
LEFT JOIN public.expense_categories ec ON ec.id = e.category_id

UNION ALL

SELECT
    ('sr-' || sr.id::text) AS id,
    sr.id AS raw_id,
    sr.business_id,
    sr.party_id,
    COALESCE(p.name, CASE WHEN sr.party_id IS NULL THEN 'Cash Return' ELSE 'Customer' END) AS party_name,
    'SaleReturn'::text AS type,
    COALESCE(
        CASE
            WHEN sr.return_number IS NOT NULL AND sr.return_number != '' AND sr.return_number NOT LIKE 'INV-%'
            THEN (CASE WHEN sr.return_number LIKE '#%' THEN sr.return_number ELSE '#' || sr.return_number END)
            ELSE NULL
        END,
        '#' || (ROW_NUMBER() OVER (PARTITION BY sr.business_id ORDER BY sr.created_at ASC, sr.id ASC))::text
    ) AS index_no,
    sr.total_amount,
    (sr.total_amount - sr.refunded_amount) AS secondary_amount,
    'Balance'::text AS secondary_label,
    CASE WHEN (sr.total_amount - sr.refunded_amount) <= 0 THEN 'Paid' WHEN sr.refunded_amount > 0 THEN 'Partial' ELSE 'Unpaid' END AS status,
    sr.note,
    sr.payment_type AS payment_method,
    sr.created_at
FROM public.sale_returns sr
LEFT JOIN public.parties p ON p.id = sr.party_id

UNION ALL

SELECT
    ('pr-' || pr.id::text) AS id,
    pr.id AS raw_id,
    pr.business_id,
    pr.party_id,
    COALESCE(p.name, CASE WHEN pr.party_id IS NULL THEN 'Cash Return' ELSE 'Supplier' END) AS party_name,
    'PurchaseReturn'::text AS type,
    COALESCE(
        CASE
            WHEN pr.return_number IS NOT NULL AND pr.return_number != '' AND pr.return_number NOT LIKE 'INV-%'
            THEN (CASE WHEN pr.return_number LIKE '#%' THEN pr.return_number ELSE '#' || pr.return_number END)
            ELSE NULL
        END,
        '#' || (ROW_NUMBER() OVER (PARTITION BY pr.business_id ORDER BY pr.created_at ASC, pr.id ASC))::text
    ) AS index_no,
    pr.total_amount,
    (pr.total_amount - pr.refunded_amount) AS secondary_amount,
    'Balance'::text AS secondary_label,
    CASE WHEN (pr.total_amount - pr.refunded_amount) <= 0 THEN 'Paid' WHEN pr.refunded_amount > 0 THEN 'Partial' ELSE 'Unpaid' END AS status,
    pr.note,
    pr.payment_type AS payment_method,
    pr.created_at
FROM public.purchase_returns pr
LEFT JOIN public.parties p ON p.id = pr.party_id;
