<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/admin-security.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'POST') {
    $body = read_json_body();
    $username = $body['username'] ?? null;
    $password = $body['password'] ?? null;
    $configuredUsername = app_config('ADMIN_USERNAME');
    $passwordHash = app_config('ADMIN_PASSWORD_HASH');

    if (!$configuredUsername || !$passwordHash) {
        throw new RuntimeException('ADMIN_USERNAME and ADMIN_PASSWORD_HASH must be configured.');
    }

    if (
        !is_string($username)
        || !is_string($password)
        || !hash_equals($configuredUsername, $username)
        || !password_verify($password, $passwordHash)
    ) {
        send_json(['error' => 'Incorrect username or password.'], 401);
    }

    send_json([
        'data' => [
            'token' => admin_token_for($configuredUsername),
            'expiresIn' => 8 * 60 * 60,
            'username' => $configuredUsername,
        ],
    ]);
}

if ($method === 'GET') {
    $username = require_admin();
    send_json(['data' => ['username' => $username]]);
}

header('Allow: GET, POST, OPTIONS');
send_json(['error' => 'Method not allowed.'], 405);
