<?php
declare(strict_types=1);

require __DIR__ . '/customer-security.php';
require __DIR__ . '/product-images.php';

header('Cache-Control: no-store');
header('Vary: Authorization');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PATCH, DELETE, OPTIONS');
    send_json(['error' => 'Method not allowed.'], 405);
}
$customer = require_customer();
$pdo = database();

if ($method === 'GET') {
    $ordersStatement = $pdo->prepare(
        "SELECT id, customer_name AS customerName, phone, address, city, pincode,
                payment_method AS payment, payment_status AS paymentStatus,
                total_amount AS total, subtotal_amount AS subtotal,
                discount_amount AS discount, online_discount_amount AS onlineDiscount,
                coupon_discount_amount AS couponDiscount, coupon_code AS couponCode,
                paid_amount AS paidAmount,
                status, created_at AS createdAt
         FROM orders
         WHERE customer_id = :customer_id
            OR (
              customer_id IS NULL
              AND (
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') = :phone
                OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') = :country_phone
              )
            )
         ORDER BY created_at DESC, id DESC"
    );
    $ordersStatement->execute([
        'customer_id' => $customer['id'],
        'phone' => $customer['phone'],
        'country_phone' => '91' . $customer['phone'],
    ]);
    $orders = $ordersStatement->fetchAll();
    $orderIds = array_column($orders, 'id');
    $itemsByOrder = [];

    if ($orderIds !== []) {
        $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
        $itemsStatement = $pdo->prepare(
            "SELECT order_id AS orderId, product_id AS productId, product_name AS name,
                    unit_price AS price, quantity
             FROM order_items
             WHERE order_id IN ({$placeholders})
             ORDER BY id"
        );
        $itemsStatement->execute($orderIds);
        foreach ($itemsStatement->fetchAll() as $item) {
            $item['productId'] = (int) $item['productId'];
            $item['price'] = (int) $item['price'];
            $item['quantity'] = (int) $item['quantity'];
            $itemsByOrder[(int) $item['orderId']][] = $item;
        }
    }

    foreach ($orders as &$order) {
        $orderId = (int) $order['id'];
        $order['id'] = $orderId;
        $order['orderNumber'] = 'AYU-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT);
        $order['total'] = (int) $order['total'];
        $order['subtotal'] = (int) $order['subtotal'];
        $order['discount'] = (int) $order['discount'];
        $order['onlineDiscount'] = (int) $order['onlineDiscount'];
        $order['couponDiscount'] = (int) $order['couponDiscount'];
        $order['paidAmount'] = (int) $order['paidAmount'];
        $order['amountDue'] = max(0, $order['total'] - $order['paidAmount']);
        $order['items'] = $itemsByOrder[$orderId] ?? [];
    }
    unset($order);

    $addressesStatement = $pdo->prepare(
        'SELECT id, label, recipient_name AS recipientName, phone, address, city, pincode,
                is_default AS isDefault
         FROM customer_addresses
         WHERE customer_id = :customer_id
         ORDER BY is_default DESC, id DESC'
    );
    $addressesStatement->execute(['customer_id' => $customer['id']]);
    $addresses = $addressesStatement->fetchAll();
    foreach ($addresses as &$address) {
        $address['id'] = (int) $address['id'];
        $address['isDefault'] = (bool) $address['isDefault'];
    }
    unset($address);

    $wishlistStatement = $pdo->prepare(
        'SELECT p.id, p.name, p.price, p.image
         FROM customer_wishlist w
         INNER JOIN products p ON p.id = w.product_id
         WHERE w.customer_id = :customer_id AND p.is_active = 1
         ORDER BY w.created_at DESC'
    );
    $wishlistStatement->execute(['customer_id' => $customer['id']]);
    $wishlist = load_product_images($pdo, $wishlistStatement->fetchAll());
    foreach ($wishlist as &$product) {
        $product['id'] = (int) $product['id'];
        $product['price'] = (int) $product['price'];
    }
    unset($product);

    $reviewableStatement = $pdo->prepare(
        "SELECT o.id AS orderId, oi.product_id AS productId,
                oi.product_name AS productName, o.created_at AS orderedAt
         FROM orders o
         INNER JOIN order_items oi ON oi.order_id = o.id
         INNER JOIN products p ON p.id = oi.product_id AND p.is_active = 1
         WHERE o.customer_id = :customer_id
           AND o.status = 'delivered'
           AND (o.payment_method <> 'RAZORPAY' OR o.payment_status = 'paid')
           AND NOT EXISTS (
             SELECT 1 FROM product_reviews pr
             WHERE pr.order_id = o.id AND pr.product_id = oi.product_id
           )
         ORDER BY o.created_at DESC, oi.id"
    );
    $reviewableStatement->execute(['customer_id' => $customer['id']]);
    $reviewableItems = $reviewableStatement->fetchAll();
    foreach ($reviewableItems as &$item) {
        $item['orderId'] = (int) $item['orderId'];
        $item['productId'] = (int) $item['productId'];
        $item['orderNumber'] = 'AYU-' . str_pad((string) $item['orderId'], 6, '0', STR_PAD_LEFT);
    }
    unset($item);

    send_json([
        'data' => [
            'profile' => $customer,
            'orders' => $orders,
            'addresses' => $addresses,
            'wishlist' => $wishlist,
            'reviewableItems' => $reviewableItems,
        ],
    ]);
}

if ($method === 'PATCH') {
    $body = read_json_body();
    $firstName = required_string($body, 'firstName', 60);
    $lastNameValue = $body['lastName'] ?? null;
    if (!is_string($lastNameValue) || strlen(trim($lastNameValue)) > 60) {
        send_json(['error' => 'The lastName field is invalid.'], 422);
    }
    $lastName = trim($lastNameValue);
    if (preg_match('/[\x00-\x1F\x7F]/', $firstName . $lastName)) {
        send_json(['error' => 'Names contain invalid characters.'], 422);
    }

    $newPassword = $body['newPassword'] ?? null;
    $currentPassword = $body['currentPassword'] ?? null;
    if ($newPassword !== null) {
        if (
            !is_string($newPassword)
            || strlen($newPassword) < 10
            || strlen($newPassword) > 72
        ) {
            send_json(['error' => 'The new password must be 10 to 72 characters long.'], 422);
        }
        if (!(bool) $customer['passwordSetupRequired'] && !is_string($currentPassword)) {
            send_json(['error' => 'Enter your current password to change it.'], 422);
        }

        $token = customer_bearer_token();
        if ($token === null) {
            send_json(['error' => 'Customer sign-in is required.'], 401);
        }
    }

    $pdo->beginTransaction();
    try {
        if ($newPassword !== null) {
            $passwordStatement = $pdo->prepare(
                'SELECT password_hash, password_setup_required
                 FROM customers WHERE id = :id FOR UPDATE'
            );
            $passwordStatement->execute(['id' => $customer['id']]);
            $passwordAccount = $passwordStatement->fetch();
            if (!$passwordAccount || !is_string($passwordAccount['password_hash'])) {
                throw new RuntimeException('The customer password could not be loaded.');
            }
            if (!(bool) $passwordAccount['password_setup_required']) {
                if (!is_string($currentPassword) || !password_verify($currentPassword, $passwordAccount['password_hash'])) {
                    $pdo->rollBack();
                    send_json(['error' => 'Current password is incorrect.'], 403);
                }
            }

            $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            if (!is_string($newPasswordHash)) {
                throw new RuntimeException('Customer password could not be securely updated.');
            }
            $updatePassword = $pdo->prepare(
                'UPDATE customers
                 SET password_hash = :hash, password_setup_required = 0, password_setup_order_id = NULL
                 WHERE id = :id'
            );
            $updatePassword->execute(['hash' => $newPasswordHash, 'id' => $customer['id']]);

            $revokeOtherSessions = $pdo->prepare(
                'DELETE FROM customer_sessions
                 WHERE customer_id = :customer_id AND token_hash <> :token_hash'
            );
            $revokeOtherSessions->execute([
                'customer_id' => $customer['id'],
                'token_hash' => hash('sha256', $token),
            ]);
        }

        $updateProfile = $pdo->prepare(
            'UPDATE customers SET first_name = :first_name, last_name = :last_name WHERE id = :id'
        );
        $updateProfile->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'id' => $customer['id'],
        ]);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
    send_json(['data' => ['updated' => true]]);
}

if ($method === 'POST') {
    $body = read_json_body();
    $action = $body['action'] ?? null;

    if ($action === 'address') {
        $labelValue = $body['label'] ?? 'Home';
        if (!is_string($labelValue)) {
            send_json(['error' => 'The address label is invalid.'], 422);
        }
        $label = trim($labelValue);
        $recipientName = required_string($body, 'recipientName', 120);
        $phone = required_string($body, 'phone', 20);
        $address = required_string($body, 'address', 500);
        $cityValue = $body['city'] ?? '';
        $city = is_string($cityValue) ? trim($cityValue) : null;
        $pincode = required_string($body, 'pincode', 12);
        $isDefaultValue = $body['isDefault'] ?? false;
        if (!is_bool($isDefaultValue)) {
            send_json(['error' => 'The default-address setting is invalid.'], 422);
        }
        $isDefault = $isDefaultValue;

        if ($label === '' || strlen($label) > 50 || $city === null || strlen($city) > 100) {
            send_json(['error' => 'Address label or city is invalid.'], 422);
        }
        if (preg_match('/[\x00-\x1F\x7F]/', $recipientName)) {
            send_json(['error' => 'Recipient name contains invalid characters.'], 422);
        }
        if (!preg_match('/^[0-9+()\-\s]{8,20}$/', $phone)) {
            send_json(['error' => 'Enter a valid phone number.'], 422);
        }
        if (!preg_match('/^[A-Za-z0-9 -]{4,12}$/', $pincode)) {
            send_json(['error' => 'Enter a valid pincode.'], 422);
        }

        $pdo->beginTransaction();
        try {
            $lockCustomer = $pdo->prepare('SELECT id FROM customers WHERE id = :id FOR UPDATE');
            $lockCustomer->execute(['id' => $customer['id']]);
            $countStatement = $pdo->prepare(
                'SELECT COUNT(*) FROM customer_addresses WHERE customer_id = :customer_id'
            );
            $countStatement->execute(['customer_id' => $customer['id']]);
            $addressCount = (int) $countStatement->fetchColumn();
            if ($addressCount >= 20) {
                $pdo->rollBack();
                send_json(['error' => 'You can save up to 20 delivery addresses.'], 422);
            }
            $makeDefault = $isDefault || $addressCount === 0;
            if ($makeDefault) {
                $clearDefault = $pdo->prepare(
                    'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = :customer_id'
                );
                $clearDefault->execute(['customer_id' => $customer['id']]);
            }

            $insertAddress = $pdo->prepare(
                'INSERT INTO customer_addresses
                   (customer_id, label, recipient_name, phone, address, city, pincode, is_default)
                 VALUES
                   (:customer_id, :label, :recipient_name, :phone, :address, :city, :pincode, :is_default)'
            );
            $insertAddress->execute([
                'customer_id' => $customer['id'],
                'label' => $label,
                'recipient_name' => $recipientName,
                'phone' => $phone,
                'address' => $address,
                'city' => $city,
                'pincode' => $pincode,
                'is_default' => $makeDefault ? 1 : 0,
            ]);
            $addressId = (int) $pdo->lastInsertId();
            $pdo->commit();
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $exception;
        }
        send_json(['data' => ['id' => $addressId]], 201);
    }

    if ($action === 'wishlist') {
        $productId = filter_var($body['productId'] ?? null, FILTER_VALIDATE_INT);
        if (!$productId || $productId < 1) {
            send_json(['error' => 'A valid product is required.'], 422);
        }
        $productStatement = $pdo->prepare('SELECT 1 FROM products WHERE id = :id AND is_active = 1');
        $productStatement->execute(['id' => $productId]);
        if (!$productStatement->fetchColumn()) {
            send_json(['error' => 'Product not found.'], 404);
        }

        $insertWishlist = $pdo->prepare(
            'INSERT INTO customer_wishlist (customer_id, product_id)
             VALUES (:customer_id, :product_id)
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP'
        );
        $insertWishlist->execute(['customer_id' => $customer['id'], 'product_id' => $productId]);
        send_json(['data' => ['saved' => true]]);
    }

    send_json(['error' => 'Choose a supported account action.'], 422);
}

if ($method === 'DELETE') {
    $resource = $_GET['resource'] ?? null;
    if ($resource === 'address') {
        $addressId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$addressId || $addressId < 1) {
            send_json(['error' => 'A valid address id is required.'], 422);
        }
        $pdo->beginTransaction();
        try {
            $lockCustomer = $pdo->prepare('SELECT id FROM customers WHERE id = :id FOR UPDATE');
            $lockCustomer->execute(['id' => $customer['id']]);
            $findAddress = $pdo->prepare(
                'SELECT is_default FROM customer_addresses
                 WHERE id = :id AND customer_id = :customer_id
                 FOR UPDATE'
            );
            $findAddress->execute(['id' => $addressId, 'customer_id' => $customer['id']]);
            $wasDefault = $findAddress->fetchColumn();
            if ($wasDefault === false) {
                $pdo->rollBack();
                send_json(['error' => 'Address not found.'], 404);
            }

            $deleteAddress = $pdo->prepare(
                'DELETE FROM customer_addresses WHERE id = :id AND customer_id = :customer_id'
            );
            $deleteAddress->execute(['id' => $addressId, 'customer_id' => $customer['id']]);
            if ((bool) $wasDefault) {
                $nextAddress = $pdo->prepare(
                    'SELECT id FROM customer_addresses WHERE customer_id = :customer_id ORDER BY id DESC LIMIT 1'
                );
                $nextAddress->execute(['customer_id' => $customer['id']]);
                $nextAddressId = $nextAddress->fetchColumn();
                if ($nextAddressId !== false) {
                    $setDefault = $pdo->prepare(
                        'UPDATE customer_addresses SET is_default = 1
                         WHERE id = :id AND customer_id = :customer_id'
                    );
                    $setDefault->execute(['id' => $nextAddressId, 'customer_id' => $customer['id']]);
                }
            }
            $pdo->commit();
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $exception;
        }
        send_json(['data' => ['deleted' => true]]);
    }

    if ($resource === 'wishlist') {
        $productId = filter_var($_GET['productId'] ?? null, FILTER_VALIDATE_INT);
        if (!$productId || $productId < 1) {
            send_json(['error' => 'A valid product id is required.'], 422);
        }
        $deleteWishlist = $pdo->prepare(
            'DELETE FROM customer_wishlist WHERE customer_id = :customer_id AND product_id = :product_id'
        );
        $deleteWishlist->execute(['customer_id' => $customer['id'], 'product_id' => $productId]);
        if ($deleteWishlist->rowCount() === 0) {
            send_json(['error' => 'Wishlist item not found.'], 404);
        }
        send_json(['data' => ['deleted' => true]]);
    }

    send_json(['error' => 'Choose an address or wishlist item to remove.'], 422);
}

header('Allow: GET, POST, PATCH, DELETE, OPTIONS');
send_json(['error' => 'Method not allowed.'], 405);
