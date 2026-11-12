<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');

$webhookSecret = app_config('RAZORPAY_WEBHOOK_SECRET');
if (!$webhookSecret) {
    send_json(['error' => 'Payment webhook is not configured.'], 503);
}

$stream = fopen('php://input', 'rb');
$rawBody = $stream === false ? false : fread($stream, 1_000_001);
if (is_resource($stream)) {
    fclose($stream);
}
$signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
if ($rawBody === false || strlen($rawBody) > 1_000_000 || !is_string($signature)) {
    send_json(['error' => 'Webhook request is invalid.'], 400);
}
$expectedSignature = hash_hmac('sha256', $rawBody, $webhookSecret);
if (!hash_equals($expectedSignature, $signature)) {
    send_json(['error' => 'Webhook signature is invalid.'], 401);
}

$event = json_decode($rawBody, true);
if (!is_array($event)) {
    send_json(['error' => 'Webhook body must be valid JSON.'], 400);
}

$eventName = $event['event'] ?? '';
$payment = $event['payload']['payment']['entity'] ?? null;
if (!is_array($payment) || !in_array($eventName, ['payment.captured', 'payment.failed'], true)) {
    send_json(['data' => ['received' => true]]);
}

$gatewayOrderId = $payment['order_id'] ?? null;
$paymentId = $payment['id'] ?? null;
if (
    !is_string($gatewayOrderId) || !preg_match('/^order_[A-Za-z0-9]+$/', $gatewayOrderId)
    || !is_string($paymentId) || !preg_match('/^pay_[A-Za-z0-9]+$/', $paymentId)
) {
    send_json(['error' => 'Webhook payment data is invalid.'], 400);
}

$pdo = database();
$pdo->beginTransaction();
$orderStatement = $pdo->prepare(
    'SELECT id, total_amount, payment_status FROM orders
     WHERE razorpay_order_id = :gateway_id AND payment_method = \'RAZORPAY\' FOR UPDATE'
);
$orderStatement->execute(['gateway_id' => $gatewayOrderId]);
$order = $orderStatement->fetch();
if (!$order) {
    $pdo->rollBack();
    send_json(['data' => ['received' => true]]);
}

if ($eventName === 'payment.captured') {
    if (
        ($payment['status'] ?? null) !== 'captured'
        || ($payment['currency'] ?? null) !== 'INR'
        || ($payment['amount'] ?? null) !== (int) $order['total_amount'] * 100
    ) {
        $pdo->rollBack();
        send_json(['error' => 'Webhook amount does not match the order.'], 422);
    }
    if ($order['payment_status'] !== 'paid') {
        $update = $pdo->prepare(
            "UPDATE orders
             SET payment_status = 'paid', razorpay_payment_id = :payment_id, paid_at = CURRENT_TIMESTAMP,
                 status = CASE WHEN status = 'pending_payment' THEN 'placed' ELSE status END
             WHERE id = :id AND payment_status <> 'paid'"
        );
        $update->execute(['payment_id' => $paymentId, 'id' => $order['id']]);
    }
} elseif ($order['payment_status'] !== 'paid') {
    $update = $pdo->prepare(
        "UPDATE orders SET payment_status = 'failed'
         WHERE id = :id AND payment_status <> 'paid'"
    );
    $update->execute(['id' => $order['id']]);
}

$pdo->commit();
send_json(['data' => ['received' => true]]);
