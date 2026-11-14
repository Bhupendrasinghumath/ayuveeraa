<?php
declare(strict_types=1);

require __DIR__ . '/customer-security.php';
require_method('POST');
header('Cache-Control: no-store');

$body = read_json_body();
$orderNumber = strtoupper(required_string($body, 'orderNumber', 24));
$phoneValue = required_string($body, 'phone', 24);
$phone = (string) preg_replace('/\D+/', '', $phoneValue);
if (strlen($phone) === 12 && str_starts_with($phone, '91')) {
    $phone = substr($phone, 2);
}
if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    send_json(['error' => 'Enter the 10-digit mobile number used at checkout.'], 422);
}
if (!preg_match('/^AYU-([0-9]{6,20})$/', $orderNumber, $orderMatch)) {
    send_json(['error' => 'Enter a valid order number, for example AYU-000123.'], 422);
}

$orderIdDigits = ltrim($orderMatch[1], '0');
$orderId = $orderIdDigits === '' ? false : filter_var($orderIdDigits, FILTER_VALIDATE_INT);
if ($orderId === false || $orderId === null || $orderId < 1) {
    send_json(['error' => 'Enter a valid order number.'], 422);
}

$pdo = database();
customer_auth_rate_limit($pdo, $phone);
$orderStatement = $pdo->prepare(
    'SELECT id, phone, payment_method AS payment, payment_status AS paymentStatus,
            total_amount AS total, subtotal_amount AS subtotal,
            discount_amount AS discount, online_discount_amount AS onlineDiscount,
            coupon_discount_amount AS couponDiscount, coupon_code AS couponCode,
            paid_amount AS paidAmount,
            status, created_at AS createdAt
     FROM orders
     WHERE id = :id
     LIMIT 1'
);
$orderStatement->execute(['id' => $orderId]);
$order = $orderStatement->fetch();
if (!$order) {
    send_json(['error' => 'We could not find an order matching those details. Check the order number and phone number.'], 404);
}

$storedPhone = (string) preg_replace('/\D+/', '', (string) $order['phone']);
if (strlen($storedPhone) === 12 && str_starts_with($storedPhone, '91')) {
    $storedPhone = substr($storedPhone, 2);
}
if (strlen($storedPhone) > 10) {
    $storedPhone = substr($storedPhone, -10);
}
if (!hash_equals($storedPhone, $phone)) {
    send_json(['error' => 'We could not find an order matching those details. Check the order number and phone number.'], 404);
}

$itemsStatement = $pdo->prepare(
    'SELECT product_name AS name, unit_price AS price, quantity
     FROM order_items
     WHERE order_id = :order_id
     ORDER BY id'
);
$itemsStatement->execute(['order_id' => $orderId]);
$items = $itemsStatement->fetchAll();
foreach ($items as &$item) {
    $item['price'] = (int) $item['price'];
    $item['quantity'] = (int) $item['quantity'];
}
unset($item);

send_json([
    'data' => [
        'id' => (int) $order['id'],
        'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT),
        'payment' => $order['payment'],
        'paymentStatus' => $order['paymentStatus'],
        'total' => (int) $order['total'],
        'subtotal' => (int) $order['subtotal'],
        'discount' => (int) $order['discount'],
        'onlineDiscount' => (int) $order['onlineDiscount'],
        'couponDiscount' => (int) $order['couponDiscount'],
        'couponCode' => $order['couponCode'],
        'paidAmount' => (int) $order['paidAmount'],
        'amountDue' => max(0, (int) $order['total'] - (int) $order['paidAmount']),
        'status' => $order['status'],
        'createdAt' => $order['createdAt'],
        'items' => $items,
    ],
]);
