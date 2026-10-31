<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/product-images.php';
require_method('GET');

$pdo = database();
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$category = trim((string) ($_GET['category'] ?? ''));

if (isset($_GET['id']) && (!$id || $id < 1)) {
    send_json(['error' => 'Product id must be a positive integer.'], 400);
}

$productColumns = 'id, name, category, slug, price, old_price AS oldPrice, rating,
                   reviews, image, description, tag, is_active, brand, short_description,
                   dosage_form, pack_size, key_benefits, ingredients, how_to_use,
                   safety_information, storage_instructions, suitable_for, product_type,
                   manufacturer, country_of_origin, shelf_life, meta_title, meta_description,
                   license_number';

if ($id !== null) {
    $statement = $pdo->prepare(
        "SELECT {$productColumns} FROM products WHERE is_active = 1 AND id = :id"
    );
    $statement->execute(['id' => $id]);
    $products = $statement->fetchAll();

    if ($products === []) {
        send_json(['error' => 'Product not found.'], 404);
    }

    $products = load_product_images($pdo, $products);
    $product = $products[0];
    $product['id'] = (int) $product['id'];
    $product['price'] = (int) $product['price'];
    $product['oldPrice'] = (int) $product['oldPrice'];
    $product['rating'] = (float) $product['rating'];
    $product['is_active'] = (bool) $product['is_active'];
    $product['key_benefits'] = decode_product_json_array($product['key_benefits']);
    $product['ingredients'] = decode_product_json_array($product['ingredients']);

    $ingredientStatement = $pdo->prepare(
        'SELECT ingredient_name, quantity, unit, display_order
         FROM product_ingredients
         WHERE product_id = :id
         ORDER BY display_order, id'
    );
    $ingredientStatement->execute(['id' => $id]);
    $product['ingredientRows'] = array_map(
        static function (array $ingredient): array {
            $ingredient['display_order'] = (int) $ingredient['display_order'];
            return $ingredient;
        },
        $ingredientStatement->fetchAll()
    );

    send_json(['data' => $product]);
}

$sql = 'SELECT id, name, category, slug, price, old_price AS oldPrice, rating,
               reviews, image, description, tag
        FROM products
        WHERE is_active = 1';
$params = [];

if ($category !== '') {
    $sql .= ' AND category = :category';
    $params['category'] = $category;
}

$sql .= ' ORDER BY id';
$statement = $pdo->prepare($sql);
$statement->execute($params);
$products = load_product_images($pdo, $statement->fetchAll());

foreach ($products as &$product) {
    $product['id'] = (int) $product['id'];
    $product['price'] = (int) $product['price'];
    $product['oldPrice'] = (int) $product['oldPrice'];
    $product['rating'] = (float) $product['rating'];
}
unset($product);

send_json(['data' => $products]);

function decode_product_json_array(?string $value): array
{
    if ($value === null || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) && array_is_list($decoded) ? $decoded : [];
}
