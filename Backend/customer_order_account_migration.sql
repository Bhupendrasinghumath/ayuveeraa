ALTER TABLE customers
  ADD COLUMN password_setup_required TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash,
  ADD COLUMN password_setup_order_id BIGINT UNSIGNED NULL AFTER password_setup_required;
