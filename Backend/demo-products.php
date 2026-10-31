<?php
declare(strict_types=1);

function seed_demo_products(PDO $pdo): array
{
    $catalog = [
        ['Ayuvya Lets Gain & i-Gain+ Combo', 'Weight Management', 1399, 1968, 4.6, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop'],
        ['Ayuvya Diabo Plus Shots', 'Sugar Management', 999, 1199, 4.6, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop'],
        ['Ayuvya Cholest Pro Juice', 'Heart Care', 749, 899, 4.5, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop'],
        ['Ayuvya Blood Purifier Syrup', 'Blood Purifier', 699, 899, 4.6, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=500&fit=crop'],
        ['Ayuvya Herbal Hair Oil', 'Hair Care', 499, 699, 4.7, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&h=500&fit=crop'],
        ['Ayuvya Glo Skin Mask', 'Skin Care', 499, 699, 4.6, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop'],
        ['Ayuvya Stress Relief Capsule', 'Stress Management', 599, 799, 4.7, 'https://images.unsplash.com/photo-1608571423902-eed4a94d8108?w=500&h=500&fit=crop'],
        ['Ayuvya Digestion Support Tablet', 'Digestion Support', 549, 749, 4.5, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=500&h=500&fit=crop'],
        ['Ayuvya Eye Care Drops', 'Eye Care', 299, 399, 4.6, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'],
        ['Ayuvya Migraine Relief Oil', 'Migraine Support', 449, 599, 4.5, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop'],
        ['Ayuvya Herbal Immunity Shots', 'Herbal Shots', 999, 1299, 4.8, 'https://images.unsplash.com/photo-1608571423902-eed4a94d8108?w=500&h=500&fit=crop'],
        ['Ayuvya Plant Protein Powder', 'Plant Protein Supplement', 1299, 1799, 4.7, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'],
    ];

    $findProduct = $pdo->prepare('SELECT id FROM products WHERE name = :name LIMIT 1');
    $insertProduct = $pdo->prepare(
        'INSERT INTO products
         (name, category, slug, price, old_price, rating, reviews, image, description, tag, is_active)
         VALUES
         (:name, :category, :slug, :price, :old_price, :rating, :reviews, :image, :description, :tag, 1)'
    );

    $pdo->beginTransaction();
    $inserted = 0;
    $skipped = 0;

    try {
        for ($id = 1; $id <= 42; $id++) {
            [$baseName, $category, $price, $oldPrice, $rating, $image] = $catalog[($id - 1) % count($catalog)];
            $name = $id <= count($catalog) ? $baseName : "{$baseName} - Pack {$id}";
            $findProduct->execute(['name' => $name]);
            if ($findProduct->fetchColumn() !== false) {
                $skipped++;
                continue;
            }

            $slug = strtolower(str_replace(['&', ' '], ['', '-'], $category));
            $insertProduct->execute([
                'name' => $name,
                'category' => $category,
                'slug' => preg_replace('/-+/', '-', $slug),
                'price' => $price,
                'old_price' => $oldPrice,
                'rating' => $rating,
                'reviews' => '0',
                'image' => $image,
                'description' => "{$baseName} - Demo listing. Replace with verified product information before launch.",
                'tag' => 'Demo Product',
            ]);
            $inserted++;
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }

    return ['inserted' => $inserted, 'skipped' => $skipped];
}
