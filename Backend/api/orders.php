<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');

$body = read_json_body();
$name = required_string($body, 'name', 120);
$phone = required_string($body, 'phone', 20);
$address = required_string($body, 'address', 500);
$cityValue = $body['city'] ?? '';
$city = is_string($cityValue) ? trim($cityValue) : null;
$pincode = required_string($body, 'pincode', 12);
$payment = $body['payment'] ?? 'COD';
$items = $body['items'] ?? null;

if ($city === null) {
    send_json(['error' => 'The city field is invalid.'], 422);
}
if (!preg_match('/^[0-9+()\-\s]{8,20}$/', $phone)) {
    send_json(['error' => 'Enter a valid phone number.'], 422);
}
if ($city !== '' && strlen($city) > 100) {
    send_json(['error' => 'The city field is invalid.'], 422);
}
if (!preg_match('/^[A-Za-z0-9 -]{4,12}$/', $pincode)) {
    send_json(['error' => 'Enter a valid pincode.'], 422);
}
if (!is_string($payment) || !in_array($payment, ['COD', 'RAZORPAY'], true)) {
    send_json(['error' => 'Choose a supported payment method.'], 422);
}
if (!is_array($items) || count($items) < 1 || count($items) > 100) {
    send_json(['error' => 'An order must contain between 1 and 100 items.'], 422);
}

$quantities = [];
foreach ($items as $item) {
    if (!is_array($item)) {
        send_json(['error' => 'Each order item must include a product id and quantity.'], 422);
    }

    $productId = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item['qty'] ?? null, FILTER_VALIDATE_INT);
    if (!$productId || $productId < 1 || !$quantity || $quantity < 1 || $quantity > 99) {
        send_json(['error' => 'Order item id or quantity is invalid.'], 422);
    }

    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
    if ($quantities[$productId] > 99) {
        send_json(['error' => 'Maximum quantity per product is 99.'], 422);
    }
}

$razorpayKeyId = null;
if ($payment === 'RAZORPAY') {
    $razorpayKeyId = app_config('RAZORPAY_KEY_ID');
    if (!$razorpayKeyId || !app_config('RAZORPAY_KEY_SECRET')) {
        send_json(['error' => 'Online payment is not configured. Please choose Cash on Delivery or contact support.'], 503);
    }
    if (!function_exists('curl_init')) {
        send_json(['error' => 'Online payment is temporarily unavailable on this server.'], 503);
    }
}

$pdo = database();
$pdo->beginTransaction();

$productIds = array_keys($quantities);
$placeholders = implode(',', array_fill(0, count($productIds), '?'));
$productStatement = $pdo->prepare(
    "SELECT id, name, price FROM products WHERE is_active = 1 AND id IN ({$placeholders})"
);
$productStatement->execute($productIds);
$products = $productStatement->fetchAll();

if (count($products) !== count($productIds)) {
    $pdo->rollBack();
    send_json(['error' => 'One or more products are unavailable. Refresh your cart and try again.'], 422);
}

$total = 0;
foreach ($products as $product) {
    $total += (int) $product['price'] * $quantities[(int) $product['id']];
}
if ($total < 1 || $total > intdiv(PHP_INT_MAX, 100)) {
    $pdo->rollBack();
    send_json(['error' => 'The order total is invalid. Please contact support.'], 422);
}

$orderStatus = $payment === 'RAZORPAY' ? 'pending_payment' : 'placed';
$orderStatement = $pdo->prepare(
    'INSERT INTO orders (customer_name, phone, address, city, pincode, payment_method, payment_status, status, total_amount)
     VALUES (:name, :phone, :address, :city, :pincode, :payment, :payment_status, :status, :total)'
);
$orderStatement->execute([
    'name' => $name,
    'phone' => $phone,
    'address' => $address,
    'city' => $city,
    'pincode' => $pincode,
    'payment' => $payment,
    'payment_status' => 'pending',
    'status' => $orderStatus,
    'total' => $total,
]);
$orderId = (int) $pdo->lastInsertId();

$itemStatement = $pdo->prepare(
    'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
     VALUES (:order_id, :product_id, :product_name, :unit_price, :quantity)'
);
foreach ($products as $product) {
    $productId = (int) $product['id'];
    $itemStatement->execute([
        'order_id' => $orderId,
        'product_id' => $productId,
        'product_name' => $product['name'],
        'unit_price' => $product['price'],
        'quantity' => $quantities[$productId],
    ]);
}

$razorpayOrderId = null;
if ($payment === 'RAZORPAY') {
    require_once __DIR__ . '/razorpay.php';
    $gatewayOrder = razorpay_request('POST', '/orders', [
        'amount' => $total * 100,
        'currency' => 'INR',
        'receipt' => 'AYU-' . $orderId,
        'notes' => ['store_order_id' => (string) $orderId],
    ]);
    $razorpayOrderId = $gatewayOrder['id'] ?? null;
    if (!is_string($razorpayOrderId) || !preg_match('/^order_[A-Za-z0-9]+$/', $razorpayOrderId)) {
        $pdo->rollBack();
        send_json(['error' => 'Payment could not be initialized. Please try again.'], 502);
    }
    $gatewayOrderStatement = $pdo->prepare('UPDATE orders SET razorpay_order_id = :gateway_id WHERE id = :id');
    $gatewayOrderStatement->execute(['gateway_id' => $razorpayOrderId, 'id' => $orderId]);
}

$pdo->commit();
send_json([
    'data' => [
        'id' => $orderId,
        'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT),
        'total' => $total,
        'payment' => $payment,
        'paymentStatus' => 'pending',
        'keyId' => $razorpayKeyId,
        'razorpayOrderId' => $razorpayOrderId,
    ],
], 201);
