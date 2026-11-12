<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');

$body = read_json_body();
$orderId = filter_var($body['orderId'] ?? null, FILTER_VALIDATE_INT);
$gatewayOrderId = $body['razorpayOrderId'] ?? null;
if (
    !$orderId || $orderId < 1
    || !is_string($gatewayOrderId) || !preg_match('/^order_[A-Za-z0-9]+$/', $gatewayOrderId)
) {
    send_json(['error' => 'Payment order details are invalid.'], 422);
}

$statement = database()->prepare(
    "UPDATE orders
     SET payment_status = 'failed'
     WHERE id = :id AND payment_method = 'RAZORPAY'
       AND razorpay_order_id = :gateway_id AND payment_status = 'pending'"
);
$statement->execute(['id' => $orderId, 'gateway_id' => $gatewayOrderId]);
send_json(['data' => ['updated' => true]]);
