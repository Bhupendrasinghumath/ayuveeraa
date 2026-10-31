ALTER TABLE orders
  MODIFY payment_method ENUM('COD', 'RAZORPAY') NOT NULL DEFAULT 'COD',
  MODIFY status ENUM('pending_payment', 'placed', 'processing', 'shipped', 'delivered', 'cancelled')
    NOT NULL DEFAULT 'placed',
  ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded')
    NOT NULL DEFAULT 'pending' AFTER payment_method,
  ADD COLUMN razorpay_order_id VARCHAR(100) NULL AFTER payment_status,
  ADD COLUMN razorpay_payment_id VARCHAR(100) NULL AFTER razorpay_order_id,
  ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL AFTER razorpay_payment_id,
  ADD UNIQUE KEY uq_orders_razorpay_order_id (razorpay_order_id),
  ADD UNIQUE KEY uq_orders_razorpay_payment_id (razorpay_payment_id);
