ALTER TABLE orders
  MODIFY payment_status ENUM('pending', 'partially_paid', 'paid', 'failed', 'refunded')
    NOT NULL DEFAULT 'pending',
  ADD COLUMN subtotal_amount INT UNSIGNED NOT NULL DEFAULT 0 AFTER total_amount,
  ADD COLUMN discount_amount INT UNSIGNED NOT NULL DEFAULT 0 AFTER subtotal_amount,
  ADD COLUMN paid_amount INT UNSIGNED NOT NULL DEFAULT 0 AFTER discount_amount;

UPDATE orders
SET subtotal_amount = total_amount,
    discount_amount = 0,
    paid_amount = CASE
      WHEN payment_status = 'paid'
        OR (payment_method = 'COD' AND status = 'delivered' AND payment_status <> 'refunded')
      THEN total_amount
      ELSE 0
    END,
    payment_status = CASE
      WHEN payment_method = 'COD' AND status = 'delivered' AND payment_status NOT IN ('paid', 'refunded')
      THEN 'paid'
      ELSE payment_status
    END;
