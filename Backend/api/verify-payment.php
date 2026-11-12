<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');
require_once __DIR__ . '/razorpay.php';

$body = read_json_body();
$orderId = filter_var($body['orderId'] ?? null, FILTER_VALIDATE_INT);
$gatewayOrderId = $body['razorpay_order_id'] ?? null;
$paymentId = $body['razorpay_payment_id'] ?? null;
$signature = $body['razorpay_signature'] ?? null;

if (
    !$orderId || $orderId < 1
    || !is_string($gatewayOrderId) || !preg_match('/^order_[A-Za-z0-9]+$/', $gatewayOrderId)
    || !is_string($paymentId) || !preg_match('/^pay_[A-Za-z0-9]+$/', $paymentId)
    || !is_string($signature) || !preg_match('/^[a-f0-9]{64}$/i', $signature)
) {
    send_json(['error' => 'Payment verification details are invalid.'], 422);
}

$keySecret = app_config('RAZORPAY_KEY_SECRET');
if (!$keySecret) {
    send_json(['error' => 'Online payment is not configured.'], 503);
}

$pdo = database();
$orderStatement = $pdo->prepare(
    'SELECT id, payment_method, payment_status, total_amount, razorpay_order_id, razorpay_payment_id
     FROM orders WHERE id = :id'
);
$orderStatement->execute(['id' => $orderId]);
$order = $orderStatement->fetch();
if (!$order || $order['payment_method'] !== 'RAZORPAY') {
    send_json(['error' => 'Order not found.'], 404);
}
if (!is_string($order['razorpay_order_id']) || !hash_equals($order['razorpay_order_id'], $gatewayOrderId)) {
    send_json(['error' => 'Payment order does not match.'], 422);
}
$expectedSignature = hash_hmac('sha256', $gatewayOrderId . '|' . $paymentId, $keySecret);
if (!hash_equals($expectedSignature, $signature)) {
    send_json(['error' => 'Payment signature could not be verified.'], 422);
}
if ($order['payment_status'] === 'paid') {
    if ($order['razorpay_payment_id'] === $paymentId) {
        send_json(['data' => ['verified' => true, 'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT), 'total' => (int) $order['total_amount']]]);
    }
    send_json(['error' => 'This order has already been paid.'], 409);
}

razorpay_capture_and_verify($paymentId, $gatewayOrderId, (int) $order['total_amount'] * 100);

$pdo->beginTransaction();
$lockedOrderStatement = $pdo->prepare('SELECT payment_status, razorpay_payment_id FROM orders WHERE id = :id FOR UPDATE');
$lockedOrderStatement->execute(['id' => $orderId]);
$lockedOrder = $lockedOrderStatement->fetch();
if ($lockedOrder['payment_status'] === 'paid') {
    $pdo->commit();
    if ($lockedOrder['razorpay_payment_id'] === $paymentId) {
        send_json(['data' => ['verified' => true, 'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT), 'total' => (int) $order['total_amount']]]);
    }
    send_json(['error' => 'This order has already been paid.'], 409);
}

$update = $pdo->prepare(
    "UPDATE orders
     SET payment_status = 'paid', razorpay_payment_id = :payment_id, paid_at = CURRENT_TIMESTAMP,
         status = CASE WHEN status = 'pending_payment' THEN 'placed' ELSE status END
     WHERE id = :id AND payment_status <> 'paid'"
);
$update->execute(['payment_id' => $paymentId, 'id' => $orderId]);
$pdo->commit();

send_json([
    'data' => [
        'verified' => true,
        'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT),
        'total' => (int) $order['total_amount'],
    ],
]);
