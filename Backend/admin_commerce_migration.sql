CREATE TABLE product_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_categories_name (name),
  UNIQUE KEY uq_product_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO product_categories (name, slug, sort_order) VALUES
  ('Weight Management', 'weight-management', 1),
  ('Hair Care', 'hair-care', 2),
  ('Skin Care', 'skin-care', 3),
  ('Stress Management', 'stress-management', 4),
  ('Blood Purifier', 'blood-purifier', 5),
  ('Digestion Support', 'digestion-support', 6),
  ('Eye Care', 'eye-care', 7),
  ('Heart Care', 'heart-care', 8),
  ('Migraine Support', 'migraine-support', 9),
  ('Herbal Shots', 'herbal-shots', 10),
  ('Plant Protein Supplement', 'plant-protein-supplement', 11),
  ('Sugar Management', 'sugar-management', 12);

CREATE TABLE promotion_settings (
  id TINYINT UNSIGNED NOT NULL,
  online_discount_percent TINYINT UNSIGNED NOT NULL DEFAULT 10,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO promotion_settings (id, online_discount_percent)
VALUES (1, 10);

CREATE TABLE coupons (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  discount_percent TINYINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  show_in_banner TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code),
  KEY ix_coupons_active_banner (is_active, show_in_banner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders
  ADD COLUMN online_discount_amount INT UNSIGNED NOT NULL DEFAULT 0 AFTER discount_amount,
  ADD COLUMN coupon_discount_amount INT UNSIGNED NOT NULL DEFAULT 0 AFTER online_discount_amount,
  ADD COLUMN coupon_code VARCHAR(40) NULL DEFAULT NULL AFTER coupon_discount_amount;

UPDATE orders
SET online_discount_amount = discount_amount,
    coupon_discount_amount = 0,
    coupon_code = NULL;
