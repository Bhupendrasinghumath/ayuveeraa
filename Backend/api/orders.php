<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/customer-security.php';
require_method('POST');

$body = read_json_body();
$name = required_string($body, 'name', 120);
$phone = required_string($body, 'phone', 20);
$address = required_string($body, 'address', 500);
$cityValue = $body['city'] ?? '';
$city = is_string($cityValue) ? trim($cityValue) : null;
$pincode = required_string($body, 'pincode', 12);
$payment = $body['payment'] ?? 'COD';
$couponCodeValue = $body['couponCode'] ?? '';
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
if (!is_string($couponCodeValue) || strlen(trim($couponCodeValue)) > 40) {
    send_json(['error' => 'The coupon code is invalid.'], 422);
}
$couponCode = strtoupper(trim($couponCodeValue));
if ($couponCode !== '' && !preg_match('/^[A-Z0-9][A-Z0-9_-]{2,39}$/', $couponCode)) {
    send_json(['error' => 'The coupon code is invalid.'], 422);
}
if ($couponCode !== '' && $payment !== 'RAZORPAY') {
    send_json(['error' => 'Coupon codes apply to full online payments only.'], 422);
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

$razorpayKeyId = app_config('RAZORPAY_KEY_ID');
if (!$razorpayKeyId || !app_config('RAZORPAY_KEY_SECRET')) {
    send_json(['error' => 'Secure checkout payment is not configured. Please contact support.'], 503);
}
if (!function_exists('curl_init')) {
    send_json(['error' => 'Secure checkout payment is temporarily unavailable on this server.'], 503);
}

$pdo = database();
$customer = optional_customer();
$pdo->beginTransaction();

$productIds = array_keys($quantities);
$placeholders = implode(',', array_fill(0, count($productIds), '?'));
$productStatement = $pdo->prepare(
    "SELECT products.id, products.name, products.price, products.image
     FROM products
     INNER JOIN product_categories ON product_categories.name = products.category
     WHERE products.is_active = 1 AND product_categories.is_active = 1
       AND products.id IN ({$placeholders})"
);
$productStatement->execute($productIds);
$products = $productStatement->fetchAll();

if (count($products) !== count($productIds)) {
    $pdo->rollBack();
    send_json(['error' => 'One or more products are unavailable. Refresh your cart and try again.'], 422);
}

$subtotal = 0;
foreach ($products as $product) {
    $subtotal += (int) $product['price'] * $quantities[(int) $product['id']];
}
if ($subtotal < 1 || $subtotal > min(4_294_967_295, intdiv(PHP_INT_MAX, 100))) {
    $pdo->rollBack();
    send_json(['error' => 'The order total is invalid. Please contact support.'], 422);
}

$onlineDiscountPercent = 0;
$onlineDiscount = 0;
$couponDiscountPercent = 0;
$couponDiscount = 0;
if ($payment === 'RAZORPAY') {
    $settings = $pdo->query(
        'SELECT online_discount_percent FROM promotion_settings WHERE id = 1'
    )->fetch();
    if (!$settings) {
        $pdo->rollBack();
        throw new RuntimeException('Promotion settings have not been initialized.');
    }
    $onlineDiscountPercent = (int) $settings['online_discount_percent'];
    if ($onlineDiscountPercent < 0 || $onlineDiscountPercent > 90) {
        $pdo->rollBack();
        throw new RuntimeException('The configured online discount is invalid.');
    }
    $onlineDiscount = min(
        $subtotal - 1,
        intdiv(($subtotal * $onlineDiscountPercent) + 50, 100),
    );
    if ($couponCode !== '') {
        $couponStatement = $pdo->prepare(
            'SELECT discount_percent
             FROM coupons
             WHERE code = :code AND is_active = 1
             LIMIT 1'
        );
        $couponStatement->execute(['code' => $couponCode]);
        $couponPercent = $couponStatement->fetchColumn();
        if ($couponPercent === false) {
            $pdo->rollBack();
            send_json(['error' => 'This coupon code is invalid or inactive.'], 422);
        }
        $couponDiscountPercent = (int) $couponPercent;
        if ($couponDiscountPercent < 1 || $couponDiscountPercent > 90) {
            $pdo->rollBack();
            throw new RuntimeException('The configured coupon discount is invalid.');
        }
        $afterOnlineDiscount = $subtotal - $onlineDiscount;
        $couponDiscount = min(
            max(0, $afterOnlineDiscount - 1),
            intdiv(($afterOnlineDiscount * $couponDiscountPercent) + 50, 100),
        );
    }
}
$discount = $onlineDiscount + $couponDiscount;
$total = $subtotal - $discount;
$paymentAmount = $payment === 'COD' ? min(99, $total) : $total;
$orderStatus = 'pending_payment';
if ($customer) {
    $orderStatement = $pdo->prepare(
        'INSERT INTO orders
           (customer_id, customer_name, phone, address, city, pincode, payment_method, payment_status, status,
            total_amount, subtotal_amount, discount_amount, online_discount_amount,
            coupon_discount_amount, coupon_code, paid_amount)
         VALUES
           (:customer_id, :name, :phone, :address, :city, :pincode, :payment, :payment_status, :status,
            :total, :subtotal, :discount, :online_discount, :coupon_discount, :coupon_code, 0)'
    );
    $orderStatement->execute([
        'customer_id' => $customer['id'],
        'name' => $name,
        'phone' => $phone,
        'address' => $address,
        'city' => $city,
        'pincode' => $pincode,
        'payment' => $payment,
        'payment_status' => 'pending',
        'status' => $orderStatus,
        'total' => $total,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'online_discount' => $onlineDiscount,
        'coupon_discount' => $couponDiscount,
        'coupon_code' => $couponCode === '' ? null : $couponCode,
    ]);
} else {
    $orderStatement = $pdo->prepare(
        'INSERT INTO orders
           (customer_name, phone, address, city, pincode, payment_method, payment_status, status,
            total_amount, subtotal_amount, discount_amount, online_discount_amount,
            coupon_discount_amount, coupon_code, paid_amount)
         VALUES
           (:name, :phone, :address, :city, :pincode, :payment, :payment_status, :status,
            :total, :subtotal, :discount, :online_discount, :coupon_discount, :coupon_code, 0)'
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
        'subtotal' => $subtotal,
        'discount' => $discount,
        'online_discount' => $onlineDiscount,
        'coupon_discount' => $couponDiscount,
        'coupon_code' => $couponCode === '' ? null : $couponCode,
    ]);
}
$orderId = (int) $pdo->lastInsertId();

$itemStatement = $pdo->prepare(
    'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
     VALUES (:order_id, :product_id, :product_name, :unit_price, :quantity)'
);
$orderItems = [];
foreach ($products as $product) {
    $productId = (int) $product['id'];
    $quantity = $quantities[$productId];
    $itemStatement->execute([
        'order_id' => $orderId,
        'product_id' => $productId,
        'product_name' => $product['name'],
        'unit_price' => $product['price'],
        'quantity' => $quantity,
    ]);
    $orderItems[] = [
        'productId' => $productId,
        'name' => (string) $product['name'],
        'price' => (int) $product['price'],
        'quantity' => $quantity,
        'image' => (string) $product['image'],
    ];
}

$razorpayOrderId = null;
require_once __DIR__ . '/razorpay.php';
$gatewayOrder = razorpay_request('POST', '/orders', [
    'amount' => $paymentAmount * 100,
    'currency' => 'INR',
    'receipt' => 'AYU-' . $orderId,
    'notes' => [
        'store_order_id' => (string) $orderId,
        'payment_type' => $payment === 'COD' ? 'cod_advance' : 'online_full',
    ],
]);
$razorpayOrderId = $gatewayOrder['id'] ?? null;
if (!is_string($razorpayOrderId) || !preg_match('/^order_[A-Za-z0-9]+$/', $razorpayOrderId)) {
    $pdo->rollBack();
    send_json(['error' => 'Payment could not be initialized. Please try again.'], 502);
}
$gatewayOrderStatement = $pdo->prepare('UPDATE orders SET razorpay_order_id = :gateway_id WHERE id = :id');
$gatewayOrderStatement->execute(['gateway_id' => $razorpayOrderId, 'id' => $orderId]);

$createdAtStatement = $pdo->prepare('SELECT created_at FROM orders WHERE id = :id');
$createdAtStatement->execute(['id' => $orderId]);
$createdAt = $createdAtStatement->fetchColumn();
if (!is_string($createdAt) || $createdAt === '') {
    $pdo->rollBack();
    throw new RuntimeException('The created order timestamp could not be loaded.');
}
$pdo->commit();
send_json([
    'data' => [
        'id' => $orderId,
        'orderNumber' => 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT),
        'subtotal' => $subtotal,
        'discount' => $discount,
        'onlineDiscount' => $onlineDiscount,
        'onlineDiscountPercent' => $onlineDiscountPercent,
        'couponDiscount' => $couponDiscount,
        'couponCode' => $couponCode === '' ? null : $couponCode,
        'total' => $total,
        'paymentAmount' => $paymentAmount,
        'paidAmount' => 0,
        'amountDue' => $total,
        'payment' => $payment,
        'paymentStatus' => 'pending',
        'status' => $orderStatus,
        'createdAt' => $createdAt,
        'customer' => ['name' => $name, 'phone' => $phone],
        'shippingAddress' => ['address' => $address, 'city' => $city, 'pincode' => $pincode],
        'items' => $orderItems,
        'customerSession' => null,
        'keyId' => $razorpayKeyId,
        'razorpayOrderId' => $razorpayOrderId,
    ],
], 201);
