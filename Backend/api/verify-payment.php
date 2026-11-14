<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/customer-security.php';
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
    'SELECT id, customer_id, customer_name, phone, address, city, pincode,
            payment_method, payment_status, total_amount, subtotal_amount,
            discount_amount, online_discount_amount, coupon_discount_amount,
            coupon_code, paid_amount, status, razorpay_order_id, razorpay_payment_id
     FROM orders WHERE id = :id'
);
$orderStatement->execute(['id' => $orderId]);
$order = $orderStatement->fetch();
if (!$order || !in_array($order['payment_method'], ['COD', 'RAZORPAY'], true)) {
    send_json(['error' => 'Order not found.'], 404);
}
if (!is_string($order['razorpay_order_id']) || !hash_equals($order['razorpay_order_id'], $gatewayOrderId)) {
    send_json(['error' => 'Payment order does not match.'], 422);
}
$expectedSignature = hash_hmac('sha256', $gatewayOrderId . '|' . $paymentId, $keySecret);
if (!hash_equals($expectedSignature, $signature)) {
    send_json(['error' => 'Payment signature could not be verified.'], 422);
}
$paymentAmount = $order['payment_method'] === 'COD'
    ? min(99, (int) $order['total_amount'])
    : (int) $order['total_amount'];
$successPaymentStatus = $order['payment_method'] === 'COD' && $paymentAmount < (int) $order['total_amount']
    ? 'partially_paid'
    : 'paid';

function verified_order_customer_session(PDO $pdo, int $orderId, array $order): ?array
{
    if ($order['customer_id'] === null) {
        return create_order_customer_session($pdo, $orderId, [
            'name' => $order['customer_name'],
            'phone' => $order['phone'],
            'address' => $order['address'],
            'city' => $order['city'],
            'pincode' => $order['pincode'],
        ]);
    }

    $setupOrderStatement = $pdo->prepare(
        'SELECT password_setup_required, password_setup_order_id
         FROM customers WHERE id = :id LIMIT 1'
    );
    $setupOrderStatement->execute(['id' => (int) $order['customer_id']]);
    $setup = $setupOrderStatement->fetch();
    if (
        !$setup
        || !(bool) $setup['password_setup_required']
        || (int) $setup['password_setup_order_id'] !== $orderId
    ) {
        return null;
    }

    return [
        'token' => create_customer_session($pdo, (int) $order['customer_id']),
        'customer' => customer_auth_response($pdo, (int) $order['customer_id']),
    ];
}

function send_verified_order_payment(array $order, int $paidAmount, ?array $customerSession): never
{
    $total = (int) $order['total_amount'];
    send_json(['data' => [
        'verified' => true,
        'orderNumber' => 'AYU-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT),
        'subtotal' => (int) $order['subtotal_amount'],
        'discount' => (int) $order['discount_amount'],
        'onlineDiscount' => (int) $order['online_discount_amount'],
        'couponDiscount' => (int) $order['coupon_discount_amount'],
        'couponCode' => $order['coupon_code'],
        'total' => $total,
        'paidAmount' => $paidAmount,
        'amountDue' => max(0, $total - $paidAmount),
        'paymentStatus' => $order['payment_status'],
        'status' => $order['status'],
        'customerSession' => $customerSession,
    ]]);
}

$isAlreadyPaid = in_array($order['payment_status'], ['paid', 'partially_paid'], true);
if ($isAlreadyPaid) {
    $statusMatchesPaymentType = $order['payment_status'] === $successPaymentStatus
        || ($order['payment_method'] === 'COD' && $order['payment_status'] === 'paid');
    if (!$statusMatchesPaymentType || $order['razorpay_payment_id'] !== $paymentId) {
        send_json(['error' => 'This order has already been paid.'], 409);
    }

    $pdo->beginTransaction();
    $sessionOrderStatement = $pdo->prepare(
        'SELECT id, customer_id, customer_name, phone, address, city, pincode,
                payment_status, total_amount, subtotal_amount, discount_amount,
                online_discount_amount, coupon_discount_amount, coupon_code,
                paid_amount, status
         FROM orders WHERE id = :id FOR UPDATE'
    );
    $sessionOrderStatement->execute(['id' => $orderId]);
    $sessionOrder = $sessionOrderStatement->fetch();
    if (!$sessionOrder) {
        $pdo->rollBack();
        send_json(['error' => 'Order not found.'], 404);
    }
    $customerSession = verified_order_customer_session($pdo, (int) $orderId, $sessionOrder);
    $pdo->commit();
    send_verified_order_payment($sessionOrder, (int) $sessionOrder['paid_amount'], $customerSession);
}

razorpay_capture_and_verify($paymentId, $gatewayOrderId, $paymentAmount * 100);

$pdo->beginTransaction();
$lockedOrderStatement = $pdo->prepare(
    'SELECT id, customer_id, customer_name, phone, address, city, pincode,
            payment_status, razorpay_payment_id, total_amount, subtotal_amount,
            discount_amount, online_discount_amount, coupon_discount_amount,
            coupon_code, paid_amount, status
     FROM orders WHERE id = :id FOR UPDATE'
);
$lockedOrderStatement->execute(['id' => $orderId]);
$lockedOrder = $lockedOrderStatement->fetch();
if (!$lockedOrder) {
    $pdo->rollBack();
    send_json(['error' => 'Order not found.'], 404);
}
if (in_array($lockedOrder['payment_status'], ['paid', 'partially_paid'], true)) {
    $statusMatchesPaymentType = $lockedOrder['payment_status'] === $successPaymentStatus
        || ($order['payment_method'] === 'COD' && $lockedOrder['payment_status'] === 'paid');
    if (!$statusMatchesPaymentType || $lockedOrder['razorpay_payment_id'] !== $paymentId) {
        $pdo->commit();
        send_json(['error' => 'This order has already been paid.'], 409);
    }

    $customerSession = verified_order_customer_session($pdo, (int) $orderId, $lockedOrder);
    $pdo->commit();
    send_verified_order_payment($lockedOrder, (int) $lockedOrder['paid_amount'], $customerSession);
}
if ($lockedOrder['payment_status'] === 'refunded') {
    $pdo->rollBack();
    send_json(['error' => 'This order payment has been refunded and cannot be confirmed.'], 409);
}

$customerSession = verified_order_customer_session($pdo, (int) $orderId, $lockedOrder);

$update = $pdo->prepare(
    "UPDATE orders
     SET payment_status = :payment_status, paid_amount = :paid_amount,
         razorpay_payment_id = :payment_id, paid_at = CURRENT_TIMESTAMP,
         status = CASE WHEN status = 'pending_payment' THEN 'placed' ELSE status END
     WHERE id = :id AND payment_status NOT IN ('paid', 'partially_paid', 'refunded')"
);
$update->execute([
    'payment_status' => $successPaymentStatus,
    'paid_amount' => $paymentAmount,
    'payment_id' => $paymentId,
    'id' => $orderId,
]);
$lockedOrder['payment_status'] = $successPaymentStatus;
$lockedOrder['paid_amount'] = $paymentAmount;
if ($lockedOrder['status'] === 'pending_payment') {
    $lockedOrder['status'] = 'placed';
}
$pdo->commit();

send_verified_order_payment($lockedOrder, $paymentAmount, $customerSession);
