-- Discount pricing: price_cents is what the student is charged; compare_at_price_cents
-- is the original/"actual" price shown struck-through (optional). Safe to re-run.

alter table public.courses
  add column if not exists compare_at_price_cents integer not null default 0;
