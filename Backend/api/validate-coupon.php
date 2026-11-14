<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');

$body = read_json_body();
$code = $body['code'] ?? null;
$payment = $body['payment'] ?? null;
if (!is_string($code) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{2,39}$/', trim($code))) {
    send_json(['error' => 'Enter a valid coupon code.'], 422);
}
if ($payment !== 'RAZORPAY') {
    send_json(['error' => 'Coupon codes apply to full online payments only.'], 422);
}

$statement = database()->prepare(
    'SELECT code, discount_percent
     FROM coupons
     WHERE code = :code AND is_active = 1
     LIMIT 1'
);
$statement->execute(['code' => strtoupper(trim($code))]);
$coupon = $statement->fetch();
if (!$coupon) {
    send_json(['error' => 'This coupon code is invalid or inactive.'], 422);
}

send_json(['data' => [
    'code' => $coupon['code'],
    'discountPercent' => (int) $coupon['discount_percent'],
]]);
