<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/admin-security.php';
require __DIR__ . '/product-images.php';

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

if ($resource === 'categories' && $method === 'GET') {
    $categories = $pdo->query(
        'SELECT c.id, c.name, c.slug, c.is_active AS isActive,
                c.sort_order AS sortOrder, COUNT(p.id) AS productCount,
                COALESCE(SUM(p.is_active = 1), 0) AS activeProductCount
         FROM product_categories c
         LEFT JOIN products p ON p.category = c.name
         GROUP BY c.id
         ORDER BY c.sort_order, c.name'
    )->fetchAll();
    foreach ($categories as &$category) {
        $category['id'] = (int) $category['id'];
        $category['isActive'] = (bool) $category['isActive'];
        $category['sortOrder'] = (int) $category['sortOrder'];
        $category['productCount'] = (int) $category['productCount'];
        $category['activeProductCount'] = (int) $category['activeProductCount'];
    }
    unset($category);
    send_json(['data' => $categories]);
}

if ($resource === 'categories' && $method === 'POST') {
    $body = read_json_body();
    $name = required_string($body, 'name', 100);
    if (!preg_match("/^[A-Za-z0-9][A-Za-z0-9 &'().-]*$/", $name)) {
        send_json(['error' => 'Use letters, numbers, spaces, and basic punctuation for the category name.'], 422);
    }
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
    if ($slug === '') {
        send_json(['error' => 'The category name cannot be converted to a web address.'], 422);
    }

    $sortOrder = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM product_categories')->fetchColumn();
    try {
        $statement = $pdo->prepare(
            'INSERT INTO product_categories (name, slug, sort_order)
             VALUES (:name, :slug, :sort_order)'
        );
        $statement->execute(['name' => $name, 'slug' => $slug, 'sort_order' => $sortOrder]);
    } catch (PDOException $exception) {
        if (($exception->errorInfo[1] ?? null) === 1062) {
            send_json(['error' => 'A category with this name or URL already exists.'], 409);
        }
        throw $exception;
    }
    send_json(['data' => ['id' => (int) $pdo->lastInsertId(), 'name' => $name, 'slug' => $slug]], 201);
}

if ($resource === 'categories' && $method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $body = read_json_body();
    $isActive = $body['isActive'] ?? null;
    if (!$id || $id < 1 || !is_bool($isActive)) {
        send_json(['error' => 'Category id or visibility is invalid.'], 422);
    }
    $categoryStatement = $pdo->prepare('SELECT name FROM product_categories WHERE id = :id');
    $categoryStatement->execute(['id' => $id]);
    $categoryName = $categoryStatement->fetchColumn();
    if (!is_string($categoryName)) {
        send_json(['error' => 'Category not found.'], 404);
    }
    if (!$isActive) {
        $activeProducts = $pdo->prepare(
            'SELECT COUNT(*) FROM products WHERE category = :category AND is_active = 1'
        );
        $activeProducts->execute(['category' => $categoryName]);
        if ((int) $activeProducts->fetchColumn() > 0) {
            send_json(['error' => 'Hide the category products first, then deactivate this category.'], 409);
        }
    }
    $statement = $pdo->prepare('UPDATE product_categories SET is_active = :active WHERE id = :id');
    $statement->execute(['active' => (int) $isActive, 'id' => $id]);
    send_json(['data' => ['updated' => true]]);
}

if ($resource === 'promotions' && $method === 'GET') {
    $settings = $pdo->query(
        'SELECT online_discount_percent AS onlineDiscountPercent
         FROM promotion_settings WHERE id = 1'
    )->fetch();
    if (!$settings) {
        throw new RuntimeException('Promotion settings have not been initialized.');
    }
    $settings['onlineDiscountPercent'] = (int) $settings['onlineDiscountPercent'];
    $settings['coupons'] = $pdo->query(
        'SELECT id, code, discount_percent AS discountPercent,
                is_active AS isActive, show_in_banner AS showInBanner,
                created_at AS createdAt
         FROM coupons ORDER BY created_at DESC, id DESC'
    )->fetchAll();
    foreach ($settings['coupons'] as &$coupon) {
        $coupon['id'] = (int) $coupon['id'];
        $coupon['discountPercent'] = (int) $coupon['discountPercent'];
        $coupon['isActive'] = (bool) $coupon['isActive'];
        $coupon['showInBanner'] = (bool) $coupon['showInBanner'];
    }
    unset($coupon);
    send_json(['data' => $settings]);
}

if ($resource === 'promotions' && $method === 'PATCH') {
    $body = read_json_body();
    $percent = filter_var($body['onlineDiscountPercent'] ?? null, FILTER_VALIDATE_INT);
    if ($percent === false || $percent < 0 || $percent > 90) {
        send_json(['error' => 'The online discount must be between 0 and 90 percent.'], 422);
    }
    $statement = $pdo->prepare(
        'UPDATE promotion_settings SET online_discount_percent = :percent WHERE id = 1'
    );
    $statement->execute(['percent' => $percent]);
    if ($statement->rowCount() === 0) {
        $exists = $pdo->query('SELECT 1 FROM promotion_settings WHERE id = 1')->fetchColumn();
        if (!$exists) {
            throw new RuntimeException('Promotion settings have not been initialized.');
        }
    }
    send_json(['data' => ['onlineDiscountPercent' => $percent]]);
}

if ($resource === 'coupons' && $method === 'GET') {
    $coupons = $pdo->query(
        'SELECT id, code, discount_percent AS discountPercent,
                is_active AS isActive, show_in_banner AS showInBanner,
                created_at AS createdAt
         FROM coupons ORDER BY created_at DESC, id DESC'
    )->fetchAll();
    foreach ($coupons as &$coupon) {
        $coupon['id'] = (int) $coupon['id'];
        $coupon['discountPercent'] = (int) $coupon['discountPercent'];
        $coupon['isActive'] = (bool) $coupon['isActive'];
        $coupon['showInBanner'] = (bool) $coupon['showInBanner'];
    }
    unset($coupon);
    send_json(['data' => $coupons]);
}

if ($resource === 'coupons' && $method === 'POST') {
    $body = read_json_body();
    $code = strtoupper(required_string($body, 'code', 40));
    $percent = filter_var($body['discountPercent'] ?? null, FILTER_VALIDATE_INT);
    $showInBanner = $body['showInBanner'] ?? false;
    if (!preg_match('/^[A-Z0-9][A-Z0-9_-]{2,39}$/', $code)) {
        send_json(['error' => 'Coupon codes must be 3–40 letters, numbers, hyphens, or underscores.'], 422);
    }
    if ($percent === false || $percent < 1 || $percent > 90 || !is_bool($showInBanner)) {
        send_json(['error' => 'Enter a coupon discount from 1 to 90 percent.'], 422);
    }
    try {
        $pdo->beginTransaction();
        if ($showInBanner) {
            $pdo->exec('UPDATE coupons SET show_in_banner = 0');
        }
        $statement = $pdo->prepare(
            'INSERT INTO coupons (code, discount_percent, show_in_banner)
             VALUES (:code, :percent, :show_in_banner)'
        );
        $statement->execute([
            'code' => $code,
            'percent' => $percent,
            'show_in_banner' => (int) $showInBanner,
        ]);
        $id = (int) $pdo->lastInsertId();
        $pdo->commit();
    } catch (PDOException $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (($exception->errorInfo[1] ?? null) === 1062) {
            send_json(['error' => 'That coupon code already exists.'], 409);
        }
        throw $exception;
    }
    send_json(['data' => ['id' => $id]], 201);
}

if ($resource === 'coupons' && $method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $body = read_json_body();
    $percent = filter_var($body['discountPercent'] ?? null, FILTER_VALIDATE_INT);
    $isActive = $body['isActive'] ?? null;
    $showInBanner = $body['showInBanner'] ?? null;
    if (
        !$id || $id < 1
        || $percent === false || $percent < 1 || $percent > 90
        || !is_bool($isActive) || !is_bool($showInBanner)
        || ($showInBanner && !$isActive)
    ) {
        send_json(['error' => 'Coupon settings are invalid.'], 422);
    }
    $pdo->beginTransaction();
    if ($showInBanner) {
        $pdo->exec('UPDATE coupons SET show_in_banner = 0');
    }
    $statement = $pdo->prepare(
        'UPDATE coupons
         SET discount_percent = :percent, is_active = :active, show_in_banner = :show_in_banner
         WHERE id = :id'
    );
    $statement->execute([
        'percent' => $percent,
        'active' => (int) $isActive,
        'show_in_banner' => (int) $showInBanner,
        'id' => $id,
    ]);
    if ($statement->rowCount() === 0) {
        $pdo->rollBack();
        $exists = $pdo->prepare('SELECT 1 FROM coupons WHERE id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetchColumn()) {
            send_json(['error' => 'Coupon not found.'], 404);
        }
    } else {
        $pdo->commit();
    }
    send_json(['data' => ['updated' => true]]);
}

if ($resource === 'customers' && $method === 'GET') {
    $customers = $pdo->query(
        'SELECT c.id, c.first_name AS firstName, c.last_name AS lastName,
                c.phone, c.created_at AS createdAt,
                COUNT(DISTINCT o.id) AS orderCount,
                COALESCE(SUM(o.paid_amount), 0) AS totalPaid,
                MAX(o.created_at) AS latestOrderAt
         FROM customers c
         LEFT JOIN orders o ON o.customer_id = c.id
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT 500'
    )->fetchAll();
    if ($customers !== []) {
        $customerIds = array_column($customers, 'id');
        $placeholders = implode(',', array_fill(0, count($customerIds), '?'));
        $addressStatement = $pdo->prepare(
            "SELECT customer_id AS customerId, label, recipient_name AS recipientName,
                    phone, address, city, pincode, is_default AS isDefault
             FROM customer_addresses
             WHERE customer_id IN ({$placeholders})
             ORDER BY is_default DESC, id DESC"
        );
        $addressStatement->execute($customerIds);
        $addressesByCustomer = [];
        foreach ($addressStatement->fetchAll() as $address) {
            $address['isDefault'] = (bool) $address['isDefault'];
            $addressesByCustomer[(int) $address['customerId']][] = $address;
        }
        foreach ($customers as &$customer) {
            $customer['id'] = (int) $customer['id'];
            $customer['orderCount'] = (int) $customer['orderCount'];
            $customer['totalPaid'] = (int) $customer['totalPaid'];
            $customer['addresses'] = $addressesByCustomer[(int) $customer['id']] ?? [];
        }
        unset($customer);
    }
    send_json(['data' => $customers]);
}

function optional_product_string(array $body, string $key, int $maxLength, string $default = ''): ?string
{
    $value = $body[$key] ?? $default;
    if (!is_string($value)) {
        send_json(['error' => "The {$key} field is invalid."], 422);
    }
    $value = trim($value);
    if (strlen($value) > $maxLength) {
        send_json(['error' => "The {$key} field is too long."], 422);
    }
    return $value === '' ? null : $value;
}

function product_text_list(array $body, string $key, int $maxItems, int $maxLength): array
{
    $value = $body[$key] ?? '';
    if (is_string($value)) {
        $value = preg_split('/\r\n|\r|\n/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
    }
    if (!is_array($value) || count($value) > $maxItems) {
        send_json(['error' => "The {$key} list is invalid."], 422);
    }
    $items = [];
    foreach ($value as $item) {
        if (!is_string($item) || strlen(trim($item)) > $maxLength) {
            send_json(['error' => "An item in {$key} is invalid."], 422);
        }
        $item = trim($item);
        if ($item !== '') {
            $items[] = $item;
        }
    }
    return $items;
}

function product_ingredient_rows(array $body): array
{
    $value = $body['ingredients'] ?? '';
    if (is_string($value)) {
        $value = preg_split('/\r\n|\r|\n/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
    }
    if (!is_array($value) || count($value) > 100) {
        send_json(['error' => 'The ingredients list is invalid.'], 422);
    }

    $rows = [];
    foreach ($value as $line) {
        if (!is_string($line)) {
            send_json(['error' => 'Each ingredient must be entered as a text line.'], 422);
        }
        $parts = array_map('trim', explode('|', $line, 3));
        $name = $parts[0] ?? '';
        $quantity = $parts[1] ?? '';
        $unit = $parts[2] ?? '';
        if ($name === '' || strlen($name) > 255 || strlen($unit) > 50) {
            send_json(['error' => 'Ingredient names and units must be within their length limits.'], 422);
        }
        if ($quantity !== '' && !preg_match('/^\d{1,8}(?:\.\d{1,2})?$/', $quantity)) {
            send_json(['error' => 'Ingredient quantities must be positive numbers with at most two decimals.'], 422);
        }
        $rows[] = [
            'name' => $name,
            'quantity' => $quantity === '' ? null : $quantity,
            'unit' => $unit === '' ? null : $unit,
        ];
    }
    return $rows;
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
    $fields = [
        'brand' => optional_product_string($body, 'brand', 100, 'AYUVEERA'),
        'short_description' => optional_product_string($body, 'short_description', 500),
        'dosage_form' => optional_product_string($body, 'dosage_form', 100),
        'pack_size' => optional_product_string($body, 'pack_size', 100),
        'key_benefits' => product_text_list($body, 'key_benefits', 30, 500),
        'ingredients' => product_ingredient_rows($body),
        'how_to_use' => optional_product_string($body, 'how_to_use', 5000),
        'safety_information' => optional_product_string($body, 'safety_information', 5000),
        'storage_instructions' => optional_product_string($body, 'storage_instructions', 5000),
        'suitable_for' => optional_product_string($body, 'suitable_for', 255),
        'product_type' => optional_product_string($body, 'product_type', 150),
        'manufacturer' => optional_product_string($body, 'manufacturer', 255),
        'country_of_origin' => optional_product_string($body, 'country_of_origin', 100, 'India'),
        'shelf_life' => optional_product_string($body, 'shelf_life', 100),
        'meta_title' => optional_product_string($body, 'meta_title', 255),
        'meta_description' => optional_product_string($body, 'meta_description', 5000),
        'license_number' => optional_product_string($body, 'license_number', 150),
    ];
    return array_merge(
        compact('name', 'category', 'slug', 'price', 'oldPrice', 'rating', 'image', 'description', 'tag'),
        $fields,
    );
}

function replace_product_ingredients(PDO $pdo, int $productId, array $ingredients): void
{
    $delete = $pdo->prepare('DELETE FROM product_ingredients WHERE product_id = :product_id');
    $delete->execute(['product_id' => $productId]);
    $insert = $pdo->prepare(
        'INSERT INTO product_ingredients
         (product_id, ingredient_name, quantity, unit, display_order)
         VALUES (:product_id, :name, :quantity, :unit, :display_order)'
    );
    foreach ($ingredients as $index => $ingredient) {
        $insert->execute([
            'product_id' => $productId,
            'name' => $ingredient['name'],
            'quantity' => $ingredient['quantity'],
            'unit' => $ingredient['unit'],
            'display_order' => $index + 1,
        ]);
    }
}

if ($resource === 'products' && $method === 'GET') {
    $statement = $pdo->query(
        'SELECT p.id, p.name, p.category, p.slug, p.price,
                p.old_price AS oldPrice, p.rating, p.reviews, p.image,
                p.description, p.tag, p.is_active AS isActive,
                p.brand, p.short_description, p.dosage_form, p.pack_size,
                p.key_benefits, p.ingredients, p.how_to_use,
                p.safety_information, p.storage_instructions, p.suitable_for,
                p.product_type, p.manufacturer, p.country_of_origin,
                p.shelf_life, p.meta_title, p.meta_description, p.license_number,
                c.slug AS categorySlug, c.is_active AS categoryActive
         FROM products p
         LEFT JOIN product_categories c ON c.name = p.category
         ORDER BY p.id DESC'
    );
    $products = load_product_images($pdo, $statement->fetchAll());
    if ($products !== []) {
        $productIds = array_column($products, 'id');
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $ingredientStatement = $pdo->prepare(
            "SELECT product_id AS productId, ingredient_name, quantity, unit, display_order
             FROM product_ingredients
             WHERE product_id IN ({$placeholders})
             ORDER BY product_id, display_order, id"
        );
        $ingredientStatement->execute($productIds);
        $ingredientsByProduct = [];
        foreach ($ingredientStatement->fetchAll() as $ingredient) {
            $ingredientsByProduct[(int) $ingredient['productId']][] = [
                'name' => $ingredient['ingredient_name'],
                'quantity' => $ingredient['quantity'],
                'unit' => $ingredient['unit'],
            ];
        }
    } else {
        $ingredientsByProduct = [];
    }
    foreach ($products as &$product) {
        $product['id'] = (int) $product['id'];
        $product['price'] = (int) $product['price'];
        $product['oldPrice'] = (int) $product['oldPrice'];
        $product['rating'] = (float) $product['rating'];
        $product['isActive'] = (bool) $product['isActive'];
        $product['categoryActive'] = (bool) $product['categoryActive'];
        $product['key_benefits'] = json_decode((string) $product['key_benefits'], true) ?: [];
        $product['ingredientRows'] = $ingredientsByProduct[$product['id']] ?? [];
    }
    unset($product);
    send_json(['data' => $products]);
}

if ($resource === 'products' && $method === 'POST') {
    $body = read_product_request();
    $multipart = product_request_is_multipart();
    $product = validate_product($body, $multipart ? 'uploads/products/' . str_repeat('0', 32) . '.jpg' : null);
    $categoryStatement = $pdo->prepare(
        'SELECT slug FROM product_categories WHERE name = :name AND is_active = 1'
    );
    $categoryStatement->execute(['name' => $product['category']]);
    $categorySlug = $categoryStatement->fetchColumn();
    if (!is_string($categorySlug)) {
        send_json(['error' => 'Choose an active product category.'], 422);
    }
    $product['slug'] = $categorySlug;
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
             (name, category, slug, price, old_price, rating, reviews, image, description, tag, is_active,
              brand, short_description, dosage_form, pack_size, key_benefits, ingredients, how_to_use,
              safety_information, storage_instructions, suitable_for, product_type, manufacturer,
              country_of_origin, shelf_life, meta_title, meta_description, license_number)
             VALUES
              (:name, :category, :slug, :price, :old_price, :rating, :reviews, :image, :description, :tag, 1,
               :brand, :short_description, :dosage_form, :pack_size, :key_benefits, :ingredients, :how_to_use,
               :safety_information, :storage_instructions, :suitable_for, :product_type, :manufacturer,
               :country_of_origin, :shelf_life, :meta_title, :meta_description, :license_number)'
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
            'brand' => $product['brand'],
            'short_description' => $product['short_description'],
            'dosage_form' => $product['dosage_form'],
            'pack_size' => $product['pack_size'],
            'key_benefits' => json_encode($product['key_benefits'], JSON_THROW_ON_ERROR),
            'ingredients' => json_encode(array_column($product['ingredients'], 'name'), JSON_THROW_ON_ERROR),
            'how_to_use' => $product['how_to_use'],
            'safety_information' => $product['safety_information'],
            'storage_instructions' => $product['storage_instructions'],
            'suitable_for' => $product['suitable_for'],
            'product_type' => $product['product_type'],
            'manufacturer' => $product['manufacturer'],
            'country_of_origin' => $product['country_of_origin'],
            'shelf_life' => $product['shelf_life'],
            'meta_title' => $product['meta_title'],
            'meta_description' => $product['meta_description'],
            'license_number' => $product['license_number'],
        ]);
        $productId = (int) $pdo->lastInsertId();
        replace_product_images($pdo, $productId, $imagePaths);
        replace_product_ingredients($pdo, $productId, $product['ingredients']);
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
        $categoryStatement = $pdo->prepare(
            'SELECT slug FROM product_categories WHERE name = :name AND is_active = 1'
        );
        $categoryStatement->execute(['name' => $product['category']]);
        $categorySlug = $categoryStatement->fetchColumn();
        if (!is_string($categorySlug)) {
            send_json(['error' => 'Choose an active product category.'], 422);
        }
        $product['slug'] = $categorySlug;
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
                 description = :description, tag = :tag, brand = :brand,
                 short_description = :short_description, dosage_form = :dosage_form,
                 pack_size = :pack_size, key_benefits = :key_benefits, ingredients = :ingredients,
                 how_to_use = :how_to_use, safety_information = :safety_information,
                 storage_instructions = :storage_instructions, suitable_for = :suitable_for,
                 product_type = :product_type, manufacturer = :manufacturer,
                 country_of_origin = :country_of_origin, shelf_life = :shelf_life,
                 meta_title = :meta_title, meta_description = :meta_description,
                 license_number = :license_number
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
                'brand' => $product['brand'],
                'short_description' => $product['short_description'],
                'dosage_form' => $product['dosage_form'],
                'pack_size' => $product['pack_size'],
                'key_benefits' => json_encode($product['key_benefits'], JSON_THROW_ON_ERROR),
                'ingredients' => json_encode(array_column($product['ingredients'], 'name'), JSON_THROW_ON_ERROR),
                'how_to_use' => $product['how_to_use'],
                'safety_information' => $product['safety_information'],
                'storage_instructions' => $product['storage_instructions'],
                'suitable_for' => $product['suitable_for'],
                'product_type' => $product['product_type'],
                'manufacturer' => $product['manufacturer'],
                'country_of_origin' => $product['country_of_origin'],
                'shelf_life' => $product['shelf_life'],
                'meta_title' => $product['meta_title'],
                'meta_description' => $product['meta_description'],
                'license_number' => $product['license_number'],
                'id' => $id,
            ]);
            replace_product_ingredients($pdo, $id, $product['ingredients']);
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
    $phoneSearch = $_GET['phone'] ?? '';
    if (!is_string($phoneSearch)) {
        send_json(['error' => 'Enter a valid phone number.'], 422);
    }

    $orderQuery = 'SELECT id, customer_name AS customerName, phone, address, city, pincode,
                          payment_method AS payment, payment_status AS paymentStatus,
                          total_amount AS total, subtotal_amount AS subtotal,
                          discount_amount AS discount, online_discount_amount AS onlineDiscount,
                          coupon_discount_amount AS couponDiscount, coupon_code AS couponCode,
                          paid_amount AS paidAmount,
                          status, created_at AS createdAt
                   FROM orders';
    $phoneSearch = trim($phoneSearch);
    if ($phoneSearch !== '') {
        $normalizedPhone = preg_replace('/\D+/', '', $phoneSearch);
        if (!is_string($normalizedPhone) || strlen($normalizedPhone) < 7 || strlen($normalizedPhone) > 15) {
            send_json(['error' => 'Enter a valid phone number with 7 to 15 digits.'], 422);
        }

        $statement = $pdo->prepare(
            $orderQuery . " WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', ''), ')', '') = :phone
                            ORDER BY created_at DESC"
        );
        $statement->execute(['phone' => $normalizedPhone]);
        $orders = $statement->fetchAll();
    } else {
        $orders = $pdo->query($orderQuery . ' ORDER BY created_at DESC LIMIT 200')->fetchAll();
    }
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
            $order['subtotal'] = (int) $order['subtotal'];
            $order['discount'] = (int) $order['discount'];
            $order['onlineDiscount'] = (int) $order['onlineDiscount'];
            $order['couponDiscount'] = (int) $order['couponDiscount'];
            $order['paidAmount'] = (int) $order['paidAmount'];
            $order['amountDue'] = max(0, $order['total'] - $order['paidAmount']);
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
    if (!$id || $id < 1) {
        send_json(['error' => 'Order id is invalid.'], 422);
    }
    $orderStatement = $pdo->prepare('SELECT payment_method, payment_status, status, razorpay_order_id FROM orders WHERE id = :id');
    $orderStatement->execute(['id' => $id]);
    $order = $orderStatement->fetch();
    if (!$order) {
        send_json(['error' => 'Order not found.'], 404);
    }
    if (($body['markBalanceReceived'] ?? false) === true) {
        if ($order['payment_method'] !== 'COD' || $order['payment_status'] !== 'partially_paid') {
            send_json(['error' => 'Only a partially paid COD order can have its delivery balance collected.'], 422);
        }
        $collectBalance = $pdo->prepare(
            "UPDATE orders
             SET payment_status = 'paid', paid_amount = total_amount
             WHERE id = :id AND payment_method = 'COD' AND payment_status = 'partially_paid'"
        );
        $collectBalance->execute(['id' => $id]);
        if ($collectBalance->rowCount() !== 1) {
            send_json(['error' => 'The COD balance could not be recorded. Refresh the order and try again.'], 409);
        }
        send_json(['data' => ['paid' => true]]);
    }
    if (!is_string($status) || !in_array($status, $validStatuses, true)) {
        send_json(['error' => 'Order status is invalid.'], 422);
    }
    if (
        $order['payment_method'] === 'RAZORPAY'
        && $order['payment_status'] !== 'paid'
        && !in_array($status, ['pending_payment', 'cancelled'], true)
    ) {
        send_json(['error' => 'An unpaid online order cannot be processed or shipped.'], 422);
    }
    if (
        $order['payment_method'] === 'COD'
        && $order['status'] === 'pending_payment'
        && !in_array($order['payment_status'], ['partially_paid', 'paid'], true)
        && !in_array($status, ['pending_payment', 'cancelled'], true)
    ) {
        send_json(['error' => 'A COD order cannot be processed until its advance is verified.'], 422);
    }
    if (
        $order['payment_method'] === 'COD'
        && $order['razorpay_order_id'] !== null
        && $status === 'delivered'
        && $order['payment_status'] !== 'paid'
    ) {
        send_json(['error' => 'Record the COD delivery balance before marking the order delivered.'], 422);
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
        'SELECT id, name, email, phone, subject, message, status, created_at AS createdAt
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
