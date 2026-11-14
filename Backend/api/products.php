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

$productColumns = 'products.id, products.name, products.category, products.slug,
                   products.price, products.old_price AS oldPrice,
                   product_categories.slug AS categorySlug,
                   COALESCE((SELECT ROUND(AVG(pr.rating), 2)
                             FROM product_reviews pr
                             WHERE pr.product_id = products.id), 0) AS rating,
                   (SELECT COUNT(*) FROM product_reviews pr
                    WHERE pr.product_id = products.id) AS reviews,
                   products.image, products.description, products.tag, products.is_active,
                   products.brand, products.short_description, products.dosage_form,
                   products.pack_size, products.key_benefits, products.ingredients,
                   products.how_to_use, products.safety_information, products.storage_instructions,
                   products.suitable_for, products.product_type, products.manufacturer,
                   products.country_of_origin, products.shelf_life, products.meta_title,
                   products.meta_description, products.license_number';

if ($id !== null) {
    $statement = $pdo->prepare(
        "SELECT {$productColumns}
         FROM products
         INNER JOIN product_categories ON product_categories.name = products.category
         WHERE products.is_active = 1 AND product_categories.is_active = 1 AND products.id = :id"
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
    $product['reviews'] = (int) $product['reviews'];
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

$sql = 'SELECT products.id, products.name, products.category, products.slug,
               products.price, products.old_price AS oldPrice,
               product_categories.slug AS categorySlug,
               COALESCE((SELECT ROUND(AVG(pr.rating), 2)
                         FROM product_reviews pr
                         WHERE pr.product_id = products.id), 0) AS rating,
               (SELECT COUNT(*) FROM product_reviews pr
                WHERE pr.product_id = products.id) AS reviews,
               products.image, products.description, products.tag
        FROM products
        INNER JOIN product_categories ON product_categories.name = products.category
        WHERE products.is_active = 1 AND product_categories.is_active = 1';
$params = [];

if ($category !== '') {
    $sql .= ' AND product_categories.slug = :category';
    $params['category'] = $category;
}

$sql .= ' ORDER BY products.id';
$statement = $pdo->prepare($sql);
$statement->execute($params);
$products = load_product_images($pdo, $statement->fetchAll());

foreach ($products as &$product) {
    $product['id'] = (int) $product['id'];
    $product['price'] = (int) $product['price'];
    $product['oldPrice'] = (int) $product['oldPrice'];
    $product['rating'] = (float) $product['rating'];
    $product['reviews'] = (int) $product['reviews'];
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
