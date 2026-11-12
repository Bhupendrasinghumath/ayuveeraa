<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/admin-security.php';
require __DIR__ . '/product-images.php';
require dirname(__DIR__) . '/demo-products.php';

require_admin();
$pdo = database();
$resource = $_GET['resource'] ?? '';
$nativeMethod = $_SERVER['REQUEST_METHOD'] ?? '';
$method = $nativeMethod;
if (
    $resource === 'products'
    && $nativeMethod === 'POST'
    && product_request_is_multipart()
    && ($_POST['_method'] ?? null) === 'PATCH'
) {
    $method = 'PATCH';
}

if ($resource === 'seed-demo' && $method === 'POST') {
    $result = seed_demo_products($pdo);
    send_json(['data' => $result], 201);
}

function validate_product(array $body, ?string $imageOverride = null): array
{
    $name = required_string($body, 'name', 255);
    $category = required_string($body, 'category', 100);
    $image = $imageOverride ?? required_string($body, 'image', 1000);
    $description = required_string($body, 'description', 5000);
    $tag = $body['tag'] ?? '';
    $price = filter_var($body['price'] ?? null, FILTER_VALIDATE_INT);
    $oldPrice = filter_var($body['oldPrice'] ?? null, FILTER_VALIDATE_INT);
    $rating = filter_var($body['rating'] ?? null, FILTER_VALIDATE_FLOAT);

    if (!is_string($tag) || strlen($tag) > 120) {
        send_json(['error' => 'The tag field is invalid.'], 422);
    }
    if ($price === false || $price < 0 || $oldPrice === false || $oldPrice < 0) {
        send_json(['error' => 'Product prices must be non-negative whole numbers.'], 422);
    }
    if ($rating === false || $rating < 0 || $rating > 5) {
        send_json(['error' => 'Product rating must be between 0 and 5.'], 422);
    }
    if (
        !is_local_product_image_path($image)
        && (!filter_var($image, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $image))
    ) {
        send_json(['error' => 'Product image must be a valid HTTPS or HTTP URL.'], 422);
    }

    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $category), '-'));
    return compact('name', 'category', 'slug', 'price', 'oldPrice', 'rating', 'image', 'description', 'tag');
}

if ($resource === 'products' && $method === 'GET') {
    $statement = $pdo->query(
        'SELECT id, name, category, slug, price, old_price AS oldPrice, rating,
                reviews, image, description, tag, is_active AS isActive
         FROM products ORDER BY id DESC'
    );
    $products = load_product_images($pdo, $statement->fetchAll());
    foreach ($products as &$product) {
        $product['id'] = (int) $product['id'];
        $product['price'] = (int) $product['price'];
        $product['oldPrice'] = (int) $product['oldPrice'];
        $product['rating'] = (float) $product['rating'];
        $product['isActive'] = (bool) $product['isActive'];
    }
    unset($product);
    send_json(['data' => $products]);
}

if ($resource === 'products' && $method === 'POST') {
    $body = read_product_request();
    $multipart = product_request_is_multipart();
    $product = validate_product($body, $multipart ? 'uploads/products/' . str_repeat('0', 32) . '.jpg' : null);
    $imagePaths = store_product_image_uploads();
    if ($multipart && $imagePaths === []) {
        send_json(['error' => 'Upload at least one product image.'], 422);
    }
    if ($imagePaths === []) {
        $imagePaths = [$product['image']];
    } else {
        $product['image'] = $imagePaths[0];
    }

    try {
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'INSERT INTO products
             (name, category, slug, price, old_price, rating, reviews, image, description, tag, is_active)
             VALUES (:name, :category, :slug, :price, :old_price, :rating, :reviews, :image, :description, :tag, 1)'
        );
        $statement->execute([
            'name' => $product['name'],
            'category' => $product['category'],
            'slug' => $product['slug'],
            'price' => $product['price'],
            'old_price' => $product['oldPrice'],
            'rating' => $product['rating'],
            'reviews' => '0',
            'image' => $product['image'],
            'description' => $product['description'],
            'tag' => $product['tag'],
        ]);
        $productId = (int) $pdo->lastInsertId();
        replace_product_images($pdo, $productId, $imagePaths);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (product_request_is_multipart()) {
            delete_product_image_files($imagePaths);
        }
        throw $exception;
    }
    send_json(['data' => ['id' => $productId]], 201);
}

if ($resource === 'products' && $method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id || $id < 1) {
        send_json(['error' => 'A valid product id is required.'], 400);
    }
    $body = read_product_request();

    if (array_key_exists('isActive', $body)) {
        if (!is_bool($body['isActive'])) {
            send_json(['error' => 'isActive must be true or false.'], 422);
        }
        $statement = $pdo->prepare('UPDATE products SET is_active = :active WHERE id = :id');
        $statement->execute(['active' => (int) $body['isActive'], 'id' => $id]);
    } else {
        $multipart = product_request_is_multipart();
        $hasUploads = product_request_has_image_uploads();
        $replaceImages = $hasUploads || !$multipart;
        $currentImagePaths = $replaceImages ? product_image_paths($pdo, $id) : [];
        $existingImage = null;
        if (!$replaceImages) {
            $existingStatement = $pdo->prepare('SELECT image FROM products WHERE id = :id');
            $existingStatement->execute(['id' => $id]);
            $existingImage = $existingStatement->fetchColumn();
            if (!is_string($existingImage)) {
                send_json(['error' => 'Product not found.'], 404);
            }
        }
        $product = validate_product(
            $body,
            $hasUploads ? 'uploads/products/' . str_repeat('0', 32) . '.jpg' : $existingImage,
        );
        $imagePaths = store_product_image_uploads();
        if ($hasUploads && $imagePaths === []) {
            send_json(['error' => 'Upload at least one product image.'], 422);
        }
        if ($replaceImages && $imagePaths === []) {
            $imagePaths = [$product['image']];
        } elseif ($imagePaths !== []) {
            $product['image'] = $imagePaths[0];
        }

        try {
            $pdo->beginTransaction();
            $statement = $pdo->prepare(
                'UPDATE products SET name = :name, category = :category, slug = :slug,
                 price = :price, old_price = :old_price, rating = :rating,
                 description = :description, tag = :tag
                 WHERE id = :id'
            );
            $statement->execute([
                'name' => $product['name'],
                'category' => $product['category'],
                'slug' => $product['slug'],
                'price' => $product['price'],
                'old_price' => $product['oldPrice'],
                'rating' => $product['rating'],
                'description' => $product['description'],
                'tag' => $product['tag'],
                'id' => $id,
            ]);
            if ($replaceImages) {
                $imageStatement = $pdo->prepare('UPDATE products SET image = :image WHERE id = :id');
                $imageStatement->execute(['image' => $imagePaths[0], 'id' => $id]);
                replace_product_images($pdo, $id, $imagePaths);
            }
            $pdo->commit();
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            if ($multipart) {
                delete_product_image_files($imagePaths);
            }
            throw $exception;
        }

        if ($replaceImages) {
            delete_unreferenced_product_images($pdo, $currentImagePaths);
        }
    }

    if ($statement->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT 1 FROM products WHERE id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetchColumn()) {
            send_json(['error' => 'Product not found.'], 404);
        }
    }
    send_json(['data' => ['updated' => true]]);
}

if ($resource === 'orders' && $method === 'GET') {
    $orders = $pdo->query(
        'SELECT id, customer_name AS customerName, phone, address, city, pincode,
                payment_method AS payment, payment_status AS paymentStatus,
                total_amount AS total, status, created_at AS createdAt
         FROM orders ORDER BY created_at DESC LIMIT 200'
    )->fetchAll();
    if ($orders !== []) {
        $ids = array_column($orders, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $itemStatement = $pdo->prepare(
            "SELECT order_id AS orderId, product_name AS name, unit_price AS price, quantity
             FROM order_items WHERE order_id IN ({$placeholders}) ORDER BY id"
        );
        $itemStatement->execute($ids);
        $itemsByOrder = [];
        foreach ($itemStatement->fetchAll() as $item) {
            $item['price'] = (int) $item['price'];
            $item['quantity'] = (int) $item['quantity'];
            $itemsByOrder[(int) $item['orderId']][] = $item;
        }
        foreach ($orders as &$order) {
            $order['id'] = (int) $order['id'];
            $order['total'] = (int) $order['total'];
            $order['items'] = $itemsByOrder[(int) $order['id']] ?? [];
        }
        unset($order);
    }
    send_json(['data' => $orders]);
}

if ($resource === 'orders' && $method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $body = read_json_body();
    $status = $body['status'] ?? null;
    $validStatuses = ['pending_payment', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!$id || $id < 1 || !is_string($status) || !in_array($status, $validStatuses, true)) {
        send_json(['error' => 'Order id or status is invalid.'], 422);
    }
    $orderStatement = $pdo->prepare('SELECT payment_method, payment_status FROM orders WHERE id = :id');
    $orderStatement->execute(['id' => $id]);
    $order = $orderStatement->fetch();
    if (!$order) {
        send_json(['error' => 'Order not found.'], 404);
    }
    if (
        $order['payment_method'] === 'RAZORPAY'
        && $order['payment_status'] !== 'paid'
        && !in_array($status, ['pending_payment', 'cancelled'], true)
    ) {
        send_json(['error' => 'An unpaid online order cannot be processed or shipped.'], 422);
    }
    $statement = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
    $statement->execute(['status' => $status, 'id' => $id]);
    if ($statement->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT 1 FROM orders WHERE id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetchColumn()) {
            send_json(['error' => 'Order not found.'], 404);
        }
    }
    send_json(['data' => ['updated' => true]]);
}

if ($resource === 'messages' && $method === 'GET') {
    $messages = $pdo->query(
        'SELECT id, name, email, subject, message, status, created_at AS createdAt
         FROM contact_messages ORDER BY created_at DESC LIMIT 200'
    )->fetchAll();
    foreach ($messages as &$message) {
        $message['id'] = (int) $message['id'];
    }
    unset($message);
    send_json(['data' => $messages]);
}

if ($resource === 'messages' && $method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $body = read_json_body();
    $status = $body['status'] ?? null;
    $validStatuses = ['new', 'read', 'resolved'];
    if (!$id || $id < 1 || !is_string($status) || !in_array($status, $validStatuses, true)) {
        send_json(['error' => 'Message id or status is invalid.'], 422);
    }
    $statement = $pdo->prepare('UPDATE contact_messages SET status = :status WHERE id = :id');
    $statement->execute(['status' => $status, 'id' => $id]);
    if ($statement->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT 1 FROM contact_messages WHERE id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetchColumn()) {
            send_json(['error' => 'Message not found.'], 404);
        }
    }
    send_json(['data' => ['updated' => true]]);
}

send_json(['error' => 'Unsupported admin resource or method.'], 404);
