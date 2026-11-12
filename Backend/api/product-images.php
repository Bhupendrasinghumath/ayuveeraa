<?php
declare(strict_types=1);

const PRODUCT_IMAGE_MAX_FILES = 6;
const PRODUCT_IMAGE_MAX_BYTES = 5242880;

class ProductImageStorageWriteException extends RuntimeException
{
}

function product_image_base_url(): string
{
    $configured = app_config('API_PUBLIC_BASE_URL');
    if ($configured !== null) {
        return rtrim($configured, '/');
    }

    $host = $_SERVER['HTTP_HOST'] ?? '';
    if (!is_string($host) || !preg_match('/\A[a-zA-Z0-9.\-:\[\]]+\z/', $host)) {
        return '';
    }

    $https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && $_SERVER['HTTPS'] !== 'off';
    $scheme = $https || ($_SERVER['SERVER_PORT'] ?? '') === '443' ? 'https' : 'http';
    $scriptPath = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $backendPath = dirname(dirname($scriptPath));
    if ($backendPath === '.' || $backendPath === DIRECTORY_SEPARATOR) {
        $backendPath = '';
    }

    return $scheme . '://' . $host . rtrim($backendPath, '/');
}

function is_local_product_image_path(string $path): bool
{
    return (bool) preg_match('/\Auploads\/products\/[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $path);
}

function public_product_image(string $path): string
{
    if (!is_local_product_image_path($path)) {
        return $path;
    }

    return product_image_base_url() . '/' . $path;
}

function load_product_images(PDO $pdo, array $products): array
{
    if ($products === []) {
        return $products;
    }

    $ids = array_map(static fn (array $product): int => (int) $product['id'], $products);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $statement = $pdo->prepare(
        "SELECT product_id, image_path FROM product_images
         WHERE product_id IN ({$placeholders}) ORDER BY product_id, position, id"
    );
    $statement->execute($ids);

    $imagesByProduct = [];
    foreach ($statement->fetchAll() as $image) {
        $imagesByProduct[(int) $image['product_id']][] = public_product_image($image['image_path']);
    }

    foreach ($products as &$product) {
        $images = $imagesByProduct[(int) $product['id']] ?? [];
        if ($images === []) {
            $images = [public_product_image((string) $product['image'])];
        }
        $product['images'] = $images;
        $product['image'] = $images[0];
    }
    unset($product);

    return $products;
}

function product_request_is_multipart(): bool
{
    return str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'multipart/form-data');
}

function php_ini_size_bytes(string $value): ?int
{
    if (!preg_match('/\A([0-9]+(?:\.[0-9]+)?)\s*([KMGT]?)\z/i', trim($value), $matches)) {
        return null;
    }

    $number = (float) $matches[1];
    $unit = strtoupper($matches[2]);
    $power = match ($unit) {
        'K' => 1,
        'M' => 2,
        'G' => 3,
        'T' => 4,
        default => 0,
    };
    $bytes = $number * (1024 ** $power);
    if (!is_finite($bytes) || $bytes > PHP_INT_MAX) {
        return null;
    }

    return (int) floor($bytes);
}

function product_request_content_type_media_type(): ?string
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!is_string($contentType) || !preg_match(
        '/\A\s*([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)(?:\s*;|\s*\z)/i',
        $contentType,
        $matches,
    )) {
        return null;
    }

    return strtolower($matches[1]);
}

function read_product_request(): array
{
    if (!product_request_is_multipart()) {
        return read_json_body();
    }

    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? '';
    if (
        $_POST === []
        && $_FILES === []
        && is_string($contentLength)
        && preg_match('/\A[0-9]+\z/', $contentLength)
        && (float) $contentLength > 0
    ) {
        $contentLengthBytes = (float) $contentLength;
        $requestSizeMb = round($contentLengthBytes / 1024 / 1024, 1);
        $postLimit = (string) ini_get('post_max_size');
        $postLimitBytes = php_ini_size_bytes($postLimit);
        $exceedsPostLimit = $postLimitBytes !== null
            && $postLimitBytes > 0
            && $contentLengthBytes > $postLimitBytes;
        $requestMethod = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
        if (!preg_match('/\A[A-Z]+\z/', $requestMethod)) {
            $requestMethod = 'UNKNOWN';
        }
        $enablePostDataReading = ini_get('enable_post_data_reading');
        if ($enablePostDataReading !== false) {
            $enablePostDataReading = in_array(
                strtolower($enablePostDataReading),
                ['1', 'on', 'true'],
                true,
            ) ? 'On' : 'Off';
        }
        $diagnostics = [
            'requestMethod' => $requestMethod,
            'contentLengthMB' => $requestSizeMb,
            'requestSizeMB' => $requestSizeMb,
            'phpPostMaxSize' => $postLimit,
            'enablePostDataReading' => $enablePostDataReading === false
                ? null
                : $enablePostDataReading,
            'contentTypeMediaType' => product_request_content_type_media_type(),
        ];

        if ($exceedsPostLimit) {
            send_json([
                'error' => "The multipart request is {$requestSizeMb} MB, which exceeds PHP post_max_size ({$postLimit}). Increase the limit above the full request size, then retry.",
                'code' => 'UPLOAD_EXCEEDS_SERVER_LIMIT',
                ...$diagnostics,
            ], 413);
        }

        send_json([
            'error' => 'PHP did not parse the multipart fields. PHP parses multipart form data natively only for POST requests; verify the request method is POST, enable_post_data_reading is On, and the hosting proxy forwards the request body.',
            'code' => 'MULTIPART_BODY_NOT_PARSED',
            ...$diagnostics,
        ], 400);
    }

    return $_POST;
}

function product_request_has_image_uploads(): bool
{
    if (!isset($_FILES['images']['error']) || !is_array($_FILES['images']['error'])) {
        return false;
    }

    foreach ($_FILES['images']['error'] as $index => $error) {
        if ($error !== UPLOAD_ERR_NO_FILE || ($_FILES['images']['name'][$index] ?? '') !== '') {
            return true;
        }
    }

    return false;
}

function store_product_image_uploads(): array
{
    if (!product_request_has_image_uploads()) {
        return [];
    }

    $upload = $_FILES['images'];
    if (!is_array($upload['name'] ?? null)) {
        send_json(['error' => 'Images must be uploaded as a gallery.'], 422);
    }

    $fileCount = count($upload['name']);
    if ($fileCount < 1 || $fileCount > PRODUCT_IMAGE_MAX_FILES) {
        send_json(['error' => 'Upload between 1 and 6 product images.'], 422);
    }

    $mimeExtensions = [
        'image/jpeg' => ['jpg', IMAGETYPE_JPEG],
        'image/png' => ['png', IMAGETYPE_PNG],
        'image/webp' => ['webp', IMAGETYPE_WEBP],
    ];
    $directory = dirname(__DIR__) . '/uploads/products';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new ProductImageStorageWriteException('Unable to create the product image storage directory.');
    }

    $validatedFiles = [];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    for ($index = 0; $index < $fileCount; $index++) {
        $error = $upload['error'][$index] ?? UPLOAD_ERR_NO_FILE;
        if ($error !== UPLOAD_ERR_OK) {
            send_json(['error' => 'One or more product images could not be uploaded.'], 422);
        }

        $temporaryPath = $upload['tmp_name'][$index] ?? '';
        $size = (int) ($upload['size'][$index] ?? 0);
        if (!is_uploaded_file($temporaryPath) || $size < 1 || $size > PRODUCT_IMAGE_MAX_BYTES) {
            send_json(['error' => 'Each product image must be no larger than 5 MB.'], 422);
        }

        $mime = $finfo->file($temporaryPath);
        $imageInfo = @getimagesize($temporaryPath);
        if (
            !is_string($mime)
            || !isset($mimeExtensions[$mime])
            || $imageInfo === false
            || $imageInfo[2] !== $mimeExtensions[$mime][1]
            || $imageInfo[0] > 8000
            || $imageInfo[1] > 8000
            || $imageInfo[0] * $imageInfo[1] > 40000000
        ) {
            send_json(['error' => 'Use valid JPEG, PNG, or WebP image files.'], 422);
        }
        $validatedFiles[] = [$temporaryPath, $mime];
    }

    $paths = [];
    try {
        foreach ($validatedFiles as [$temporaryPath, $mime]) {
            $filename = bin2hex(random_bytes(16)) . '.' . $mimeExtensions[$mime][0];
            if (!move_uploaded_file($temporaryPath, $directory . '/' . $filename)) {
                throw new ProductImageStorageWriteException('A product image could not be moved into storage.');
            }
            $paths[] = 'uploads/products/' . $filename;
        }
    } catch (Throwable $exception) {
        delete_product_image_files($paths);
        throw $exception;
    }

    return $paths;
}

function delete_product_image_files(array $paths): void
{
    $directory = dirname(__DIR__) . '/uploads/products';
    foreach ($paths as $path) {
        if (
            !is_string($path)
            || !is_local_product_image_path($path)
        ) {
            continue;
        }
        $file = $directory . '/' . basename($path);
        if (is_file($file)) {
            unlink($file);
        }
    }
}

function product_image_paths(PDO $pdo, int $productId): array
{
    $statement = $pdo->prepare(
        'SELECT image_path FROM product_images WHERE product_id = :product_id ORDER BY position, id'
    );
    $statement->execute(['product_id' => $productId]);

    return array_column($statement->fetchAll(), 'image_path');
}

function replace_product_images(PDO $pdo, int $productId, array $paths): void
{
    $delete = $pdo->prepare('DELETE FROM product_images WHERE product_id = :product_id');
    $delete->execute(['product_id' => $productId]);
    $insert = $pdo->prepare(
        'INSERT INTO product_images (product_id, image_path, position)
         VALUES (:product_id, :image_path, :position)'
    );

    foreach ($paths as $position => $path) {
        $insert->execute([
            'product_id' => $productId,
            'image_path' => $path,
            'position' => $position,
        ]);
    }
}

function delete_unreferenced_product_images(PDO $pdo, array $paths): void
{
    $check = $pdo->prepare(
        'SELECT COUNT(*) FROM product_images WHERE image_path = :path'
    );
    $unusedPaths = [];
    foreach ($paths as $path) {
        if (!is_local_product_image_path((string) $path)) {
            continue;
        }
        $check->execute(['path' => $path]);
        if ((int) $check->fetchColumn() === 0) {
            $unusedPaths[] = $path;
        }
    }
    delete_product_image_files($unusedPaths);
}
