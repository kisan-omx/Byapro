-- ================================================================
-- Migration: create_core_tables
-- Drops & recreates sales/sale_items (0 rows, schema change needed)
-- Creates: parties, items, purchases, purchase_items,
--          payment_in, payment_out, expense_categories, expenses
-- Business rules enforced via CHECK constraints.
-- RLS: every table isolated by business_id via firebase_uid().
-- ================================================================

-- ---------------------------------------------------------------
-- DROP existing empty sales tables (safe: 0 rows, schema changed)
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS public.sale_items;
DROP TABLE IF EXISTS public.sales;

-- ---------------------------------------------------------------
-- PARTIES  (common customer / supplier table)
-- ---------------------------------------------------------------
CREATE TABLE public.parties (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    phone       TEXT,
    type        TEXT        NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- ITEMS  (inventory / products)
-- ---------------------------------------------------------------
CREATE TABLE public.items (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id      UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name             TEXT          NOT NULL,
    sku              TEXT,
    selling_price    NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    purchase_price   NUMERIC(12,2)          CHECK (purchase_price >= 0),
    stock_quantity   NUMERIC(12,3) NOT NULL  DEFAULT 0,
    low_stock_alert  NUMERIC(12,3),
    unit             TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- SALES
-- Business rule: credit / partial → party_id required
--               cash            → party_id optional
-- ---------------------------------------------------------------
CREATE TABLE public.sales (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    party_id        UUID                   REFERENCES public.parties(id) ON DELETE SET NULL,
    invoice_number  TEXT          NOT NULL,
    total_amount    NUMERIC(12,2) NOT NULL CHECK (total_amount    >= 0),
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (received_amount >= 0),
    payment_type    TEXT          NOT NULL CHECK (payment_type IN ('cash','credit','partial')),
    note            TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT sale_credit_requires_party    CHECK (payment_type = 'cash' OR party_id IS NOT NULL),
    CONSTRAINT sale_received_not_exceed_total CHECK (received_amount <= total_amount),
    UNIQUE (business_id, invoice_number)
);

-- ---------------------------------------------------------------
-- SALE_ITEMS
-- ---------------------------------------------------------------
CREATE TABLE public.sale_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id      UUID          NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    item_id      UUID                   REFERENCES public.items(id) ON DELETE SET NULL,
    item_name    TEXT          NOT NULL,
    quantity     NUMERIC(12,3) NOT NULL CHECK (quantity     > 0),
    unit_price   NUMERIC(12,2) NOT NULL CHECK (unit_price  >= 0),
    discount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- PURCHASES
-- Business rule: credit / partial → party_id required
-- ---------------------------------------------------------------
CREATE TABLE public.purchases (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id    UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    party_id       UUID                   REFERENCES public.parties(id) ON DELETE SET NULL,
    invoice_number TEXT,                  -- supplier's invoice number, optional
    total_amount   NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    payment_type   TEXT          NOT NULL CHECK (payment_type IN ('cash','credit','partial')),
    note           TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT purchase_credit_requires_party   CHECK (payment_type = 'cash' OR party_id IS NOT NULL),
    CONSTRAINT purchase_paid_not_exceed_total   CHECK (paid_amount <= total_amount)
);

-- ---------------------------------------------------------------
-- PURCHASE_ITEMS
-- ---------------------------------------------------------------
CREATE TABLE public.purchase_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id  UUID          NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    item_id      UUID                   REFERENCES public.items(id) ON DELETE SET NULL,
    item_name    TEXT          NOT NULL,
    quantity     NUMERIC(12,3) NOT NULL CHECK (quantity    > 0),
    unit_price   NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- PAYMENT_IN  (money received FROM a party)
-- party_id always required — you must know who paid
-- ---------------------------------------------------------------
CREATE TABLE public.payment_in (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id    UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    party_id       UUID          NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT          NOT NULL CHECK (payment_method IN ('cash','bank','cheque','online')),
    note           TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- PAYMENT_OUT  (money paid TO a party)
-- party_id always required — you must know who received it
-- ---------------------------------------------------------------
CREATE TABLE public.payment_out (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id    UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    party_id       UUID          NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT          NOT NULL CHECK (payment_method IN ('cash','bank','cheque','online')),
    note           TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- EXPENSE_CATEGORIES
-- ---------------------------------------------------------------
CREATE TABLE public.expense_categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (business_id, name)
);

-- ---------------------------------------------------------------
-- EXPENSES  (no party — only category)
-- ---------------------------------------------------------------
CREATE TABLE public.expenses (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id    UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id    UUID          NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT          NOT NULL CHECK (payment_method IN ('cash','bank','cheque','online')),
    note           TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------
ALTER TABLE public.parties            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_in         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_out        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses           ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- INDEXES  (justified by actual query patterns)
-- ---------------------------------------------------------------
-- parties
CREATE INDEX idx_parties_business_id     ON public.parties (business_id);
CREATE INDEX idx_parties_business_type   ON public.parties (business_id, type);

-- items
CREATE INDEX idx_items_business_id       ON public.items (business_id);

-- sales
CREATE INDEX idx_sales_business_id       ON public.sales (business_id);
CREATE INDEX idx_sales_business_created  ON public.sales (business_id, created_at DESC, id DESC);
CREATE INDEX idx_sales_party_id          ON public.sales (party_id) WHERE party_id IS NOT NULL;

-- sale_items
CREATE INDEX idx_sale_items_sale_id      ON public.sale_items (sale_id);
CREATE INDEX idx_sale_items_item_id      ON public.sale_items (item_id) WHERE item_id IS NOT NULL;

-- purchases
CREATE INDEX idx_purchases_business_id      ON public.purchases (business_id);
CREATE INDEX idx_purchases_business_created ON public.purchases (business_id, created_at DESC, id DESC);
CREATE INDEX idx_purchases_party_id         ON public.purchases (party_id) WHERE party_id IS NOT NULL;

-- purchase_items
CREATE INDEX idx_purchase_items_purchase_id ON public.purchase_items (purchase_id);
CREATE INDEX idx_purchase_items_item_id     ON public.purchase_items (item_id) WHERE item_id IS NOT NULL;

-- payment_in
CREATE INDEX idx_payment_in_business_id ON public.payment_in (business_id);
CREATE INDEX idx_payment_in_party_id    ON public.payment_in (party_id);
CREATE INDEX idx_payment_in_created     ON public.payment_in (business_id, created_at DESC, id DESC);

-- payment_out
CREATE INDEX idx_payment_out_business_id ON public.payment_out (business_id);
CREATE INDEX idx_payment_out_party_id    ON public.payment_out (party_id);
CREATE INDEX idx_payment_out_created     ON public.payment_out (business_id, created_at DESC, id DESC);

-- expenses
CREATE INDEX idx_expenses_business_id   ON public.expenses (business_id);
CREATE INDEX idx_expenses_category_id   ON public.expenses (category_id);
CREATE INDEX idx_expenses_created       ON public.expenses (business_id, created_at DESC, id DESC);

-- expense_categories
CREATE INDEX idx_expense_categories_business_id ON public.expense_categories (business_id);

-- ---------------------------------------------------------------
-- RLS POLICIES
-- Pattern: business_id IN (SELECT business_id FROM users WHERE id = firebase_uid())
-- For child tables (sale_items, purchase_items): join through parent.
-- ---------------------------------------------------------------

-- PARTIES
CREATE POLICY "parties: read"   ON public.parties FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "parties: insert" ON public.parties FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "parties: update" ON public.parties FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "parties: delete" ON public.parties FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- ITEMS
CREATE POLICY "items: read"   ON public.items FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "items: insert" ON public.items FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "items: update" ON public.items FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "items: delete" ON public.items FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- SALES
CREATE POLICY "sales: read"   ON public.sales FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "sales: insert" ON public.sales FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "sales: update" ON public.sales FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "sales: delete" ON public.sales FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- SALE_ITEMS (derived via parent sale)
CREATE POLICY "sale_items: read"   ON public.sale_items FOR SELECT     USING      (sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "sale_items: insert" ON public.sale_items FOR INSERT     WITH CHECK (sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "sale_items: update" ON public.sale_items FOR UPDATE     USING      (sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "sale_items: delete" ON public.sale_items FOR DELETE     USING      (sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));

-- PURCHASES
CREATE POLICY "purchases: read"   ON public.purchases FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "purchases: insert" ON public.purchases FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "purchases: update" ON public.purchases FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "purchases: delete" ON public.purchases FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- PURCHASE_ITEMS (derived via parent purchase)
CREATE POLICY "purchase_items: read"   ON public.purchase_items FOR SELECT     USING      (purchase_id IN (SELECT id FROM public.purchases WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "purchase_items: insert" ON public.purchase_items FOR INSERT     WITH CHECK (purchase_id IN (SELECT id FROM public.purchases WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "purchase_items: update" ON public.purchase_items FOR UPDATE     USING      (purchase_id IN (SELECT id FROM public.purchases WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));
CREATE POLICY "purchase_items: delete" ON public.purchase_items FOR DELETE     USING      (purchase_id IN (SELECT id FROM public.purchases WHERE business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid())));

-- PAYMENT_IN
CREATE POLICY "payment_in: read"   ON public.payment_in FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_in: insert" ON public.payment_in FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_in: update" ON public.payment_in FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_in: delete" ON public.payment_in FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- PAYMENT_OUT
CREATE POLICY "payment_out: read"   ON public.payment_out FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_out: insert" ON public.payment_out FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_out: update" ON public.payment_out FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "payment_out: delete" ON public.payment_out FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- EXPENSE_CATEGORIES
CREATE POLICY "expense_categories: read"   ON public.expense_categories FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expense_categories: insert" ON public.expense_categories FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expense_categories: update" ON public.expense_categories FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expense_categories: delete" ON public.expense_categories FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));

-- EXPENSES
CREATE POLICY "expenses: read"   ON public.expenses FOR SELECT     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expenses: insert" ON public.expenses FOR INSERT     WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expenses: update" ON public.expenses FOR UPDATE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
CREATE POLICY "expenses: delete" ON public.expenses FOR DELETE     USING      (business_id IN (SELECT business_id FROM public.users WHERE id = public.firebase_uid()));
