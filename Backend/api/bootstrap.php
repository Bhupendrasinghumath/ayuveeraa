<?php
declare(strict_types=1);

function app_config(string $key): ?string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    static $localConfig = null;
    if ($localConfig === null) {
        $configFile = dirname(__DIR__) . '/config.local.php';
        $localConfig = is_file($configFile) ? require $configFile : [];
        if (!is_array($localConfig)) {
            throw new RuntimeException('Backend config.local.php must return an array.');
        }
    }

    $value = $localConfig[$key] ?? null;
    return is_string($value) && $value !== '' ? $value : null;
}

function send_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedOrigins = array_filter(array_map(
    'trim',
    explode(',', app_config('API_ALLOWED_ORIGINS') ?? 'http://localhost:5173,http://127.0.0.1:5173,https://ayuveeraa.vercel.app')
));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

set_exception_handler(static function (Throwable $exception): void {
    error_log($exception->__toString());

    if ($exception instanceof PDOException) {
        $sqlState = $exception->errorInfo[0] ?? $exception->getCode();
        $driverCode = $exception->errorInfo[1] ?? null;
        if (
            ($sqlState === '42S02' || $sqlState === '42S22')
            && preg_match('/password_setup_required|password_setup_order_id/i', $exception->getMessage())
        ) {
            send_json([
                'error' => 'Order-created customer accounts are not configured. Run Backend/customer_order_account_migration.sql against the configured database.',
                'code' => 'CUSTOMER_ORDER_ACCOUNT_MIGRATION_MISSING',
            ], 500);
        }
        if (
            ($sqlState === '42S02' || $sqlState === '42S22')
            && preg_match('/customer_sessions|customer_auth_limits|customer_addresses|customer_wishlist|customers|customer_id/i', $exception->getMessage())
        ) {
            send_json([
                'error' => 'Customer account tables are missing. Run Backend/customer_accounts_migration.sql against the configured database.',
                'code' => 'CUSTOMER_ACCOUNT_MIGRATION_MISSING',
            ], 500);
        }
        if (
            $sqlState === '42S02'
            && $driverCode === 1146
            && preg_match('/(?:^|[^a-zA-Z0-9_])product_images(?:$|[^a-zA-Z0-9_])/i', $exception->getMessage())
        ) {
            send_json([
                'error' => 'The product image gallery table is missing. Run Backend/product_images_migration.sql on the production database, then retry.',
                'code' => 'PRODUCT_IMAGES_MIGRATION_MISSING',
            ], 500);
        }
        if (
            preg_match('/product_categories|promotion_settings|coupons|online_discount_amount|coupon_discount_amount|coupon_code/i', $exception->getMessage())
            && (
                $sqlState === '42S02'
                || $sqlState === '42S22'
            )
        ) {
            send_json([
                'error' => 'Admin categories and promotion controls are not configured. Run Backend/admin_commerce_migration.sql against the configured database.',
                'code' => 'ADMIN_COMMERCE_MIGRATION_MISSING',
            ], 500);
        }
        if (
            preg_match('/subtotal_amount|discount_amount|paid_amount|partially_paid/i', $exception->getMessage())
            && (
                $sqlState === '42S02'
                || $sqlState === '42S22'
                || $driverCode === 1265
            )
        ) {
            send_json([
                'error' => 'COD advance and online discount fields are not configured. Run Backend/cod_advance_online_discount_migration.sql against the configured database.',
                'code' => 'COD_PAYMENT_MIGRATION_MISSING',
            ], 500);
        }

        if ($sqlState === '42S02' || $sqlState === '42S22') {
            send_json([
                'error' => 'Database schema mismatch. Confirm the products table and columns match Backend/schema.sql.',
                'code' => 'DATABASE_SCHEMA_MISMATCH',
            ], 500);
        }

        send_json([
            'error' => 'Database connection or query failed. Check DB settings, MySQL access, and the PDO MySQL extension.',
            'code' => 'DATABASE_FAILURE',
        ], 500);
    }

    if ($exception instanceof ProductImageStorageWriteException) {
        send_json([
            'error' => 'Product image storage could not be written. Check that Backend/uploads/products exists and is writable by PHP.',
            'code' => 'PRODUCT_IMAGE_STORAGE_WRITE_FAILED',
        ], 500);
    }

    if ($exception instanceof RuntimeException && $exception->getMessage() === 'Database environment variables are not configured.') {
        send_json([
            'error' => 'Database configuration is missing on the PHP host. Set DB_HOST, DB_NAME, DB_USER, and DB_PASS.',
            'code' => 'DATABASE_CONFIGURATION_MISSING',
        ], 500);
    }

    if ($exception instanceof RuntimeException && str_starts_with($exception->getMessage(), 'CUSTOMER_AUTH_SECRET')) {
        send_json([
            'error' => 'Customer authentication is not configured on the PHP host. Set CUSTOMER_AUTH_SECRET to a private random value of at least 32 characters.',
            'code' => 'CUSTOMER_AUTH_CONFIGURATION_MISSING',
        ], 500);
    }

    send_json(['error' => 'An unexpected server error occurred.'], 500);
});

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header("Allow: {$method}, OPTIONS");
        send_json(['error' => 'Method not allowed.'], 405);
    }
}

function read_json_body(): array
{
    $stream = fopen('php://input', 'rb');
    $raw = $stream === false ? false : fread($stream, 1_000_001);
    if (is_resource($stream)) {
        fclose($stream);
    }

    if ($raw === false || strlen($raw) > 1_000_000) {
        send_json(['error' => 'Request body is missing or too large.'], 413);
    }

    $body = json_decode($raw, true);
    if (!is_array($body)) {
        send_json(['error' => 'Request body must be valid JSON.'], 400);
    }

    return $body;
}

function required_string(array $body, string $key, int $maxLength): string
{
    $value = $body[$key] ?? null;
    if (!is_string($value)) {
        send_json(['error' => "The {$key} field is required."], 422);
    }

    $value = trim($value);
    if ($value === '' || strlen($value) > $maxLength) {
        send_json(['error' => "The {$key} field is invalid."], 422);
    }

    return $value;
}

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = app_config('DB_HOST');
    $name = app_config('DB_NAME');
    $user = app_config('DB_USER');
    $password = app_config('DB_PASS');

    if (!$host || !$name || !$user || !$password) {
        throw new RuntimeException('Database environment variables are not configured.');
    }

    $pdo = new PDO(
        "mysql:host={$host};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}
