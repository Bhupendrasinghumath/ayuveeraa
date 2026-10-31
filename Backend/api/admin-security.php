<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function admin_token_secret(): string
{
    $secret = app_config('ADMIN_TOKEN_SECRET');
    if (!$secret || strlen($secret) < 32) {
        throw new RuntimeException('ADMIN_TOKEN_SECRET must be set to at least 32 characters.');
    }

    return $secret;
}

function admin_token_for(string $username): string
{
    $payload = base64url_encode(json_encode([
        'sub' => $username,
        'exp' => time() + 8 * 60 * 60,
    ], JSON_THROW_ON_ERROR));
    $signature = base64url_encode(hash_hmac('sha256', $payload, admin_token_secret(), true));

    return "{$payload}.{$signature}";
}

function require_admin(): string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $headers['Authorization'] ?? '';
    if (!is_string($authorization) || !preg_match('/^Bearer ([A-Za-z0-9._-]+)$/', $authorization, $matches)) {
        send_json(['error' => 'Admin sign-in required.'], 401);
    }

    $parts = explode('.', $matches[1]);
    if (count($parts) !== 2) {
        send_json(['error' => 'Admin session is invalid. Sign in again.'], 401);
    }

    [$payload, $signature] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', $payload, admin_token_secret(), true));
    if (!hash_equals($expected, $signature)) {
        send_json(['error' => 'Admin session is invalid. Sign in again.'], 401);
    }

    $decoded = base64_decode(strtr($payload, '-_', '+/'));
    $claims = $decoded === false ? null : json_decode($decoded, true);
    $configuredUsername = app_config('ADMIN_USERNAME');
    if (
        !is_array($claims)
        || !isset($claims['sub'], $claims['exp'])
        || !is_string($claims['sub'])
        || !is_int($claims['exp'])
        || $claims['exp'] <= time()
        || !$configuredUsername
        || !hash_equals($configuredUsername, $claims['sub'])
    ) {
        send_json(['error' => 'Admin session expired. Sign in again.'], 401);
    }

    return $claims['sub'];
}
