-- ================================================================
-- Migration: create_unified_transactions_view
-- Creates public.unified_transactions view with security_invoker = true.
-- Enforces Row Level Security (RLS) policies of the querying user.
-- ================================================================

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
    s.invoice_number AS index_no,
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
    COALESCE(pur.invoice_number, '#') AS index_no,
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
    '#'::text AS index_no,
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
    '#'::text AS index_no,
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
    '#'::text AS index_no,
    e.amount AS total_amount,
    e.amount AS secondary_amount,
    'Unused'::text AS secondary_label,
    'Paid'::text AS status,
    e.note,
    e.payment_method,
    e.created_at
FROM public.expenses e
LEFT JOIN public.expense_categories ec ON ec.id = e.category_id;
