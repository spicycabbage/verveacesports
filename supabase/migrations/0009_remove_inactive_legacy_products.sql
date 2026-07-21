-- Remove hidden legacy placeholder catalog (generic sporting-goods demo items).
-- Safe: only deletes inactive products with no order_items (FK is ON DELETE RESTRICT).

delete from public.products p
where p.is_active = false
  and not exists (
    select 1 from public.order_items oi where oi.product_id = p.id
  );
