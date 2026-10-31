<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/api/bootstrap.php';
require __DIR__ . '/demo-products.php';

$result = seed_demo_products(database());
fwrite(
    STDOUT,
    "Inserted {$result['inserted']} demo products; skipped {$result['skipped']} existing names.\n"
);
