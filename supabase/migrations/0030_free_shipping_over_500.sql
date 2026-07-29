-- Free standard shipping at $500+ (order currency) for all rates.

update public.shipping_rates
set free_over = 500.00
where free_over is not null;
