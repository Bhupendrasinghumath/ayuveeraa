<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('GET');

$pdo = database();
$settings = $pdo->query(
    'SELECT online_discount_percent
     FROM promotion_settings
     WHERE id = 1'
)->fetch();
if (!$settings) {
    throw new RuntimeException('Promotion settings have not been initialized.');
}

$couponStatement = $pdo->query(
    'SELECT code, discount_percent
     FROM coupons
     WHERE is_active = 1 AND show_in_banner = 1
     ORDER BY id DESC
     LIMIT 1'
);
$coupon = $couponStatement->fetch();
send_json(['data' => [
    'onlineDiscountPercent' => (int) $settings['online_discount_percent'],
    'featuredCoupon' => $coupon
        ? ['code' => $coupon['code'], 'discountPercent' => (int) $coupon['discount_percent']]
        : null,
]]);
