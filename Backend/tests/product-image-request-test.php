<?php
declare(strict_types=1);

require dirname(__DIR__) . '/api/product-images.php';

$cases = [
    ['0', 0],
    ['1024', 1024],
    ['1K', 1024],
    ['2M', 2097152],
    ['1.5G', 1610612736],
];

foreach ($cases as [$input, $expected]) {
    if (php_ini_size_bytes($input) !== $expected) {
        throw new RuntimeException("Unexpected parsed size for {$input}.");
    }
}

if (PHP_INT_SIZE >= 8 && php_ini_size_bytes('1T') !== 1099511627776) {
    throw new RuntimeException('Unexpected parsed size for 1T.');
}

foreach (['', '-1M', '1P', '40MB'] as $input) {
    if (php_ini_size_bytes($input) !== null) {
        throw new RuntimeException("Invalid size {$input} should not be parsed.");
    }
}

if (php_ini_size_bytes('999999999999999999999T') !== null) {
    throw new RuntimeException('An overflowing size should not be parsed.');
}

$requestSizeBytes = (int) round(1.8 * 1024 * 1024);
$postMaxSizeBytes = php_ini_size_bytes('2048M');
if ($postMaxSizeBytes === null || $requestSizeBytes > $postMaxSizeBytes) {
    throw new RuntimeException('A 1.8 MB request must not exceed 2048M.');
}

$_SERVER['CONTENT_TYPE'] = 'multipart/form-data; boundary=private-boundary';
if (product_request_content_type_media_type() !== 'multipart/form-data') {
    throw new RuntimeException('The diagnostic content type must omit multipart parameters.');
}

echo "Product image request size tests passed.\n";
