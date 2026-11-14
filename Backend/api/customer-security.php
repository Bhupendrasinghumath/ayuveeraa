<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function customer_auth_secret(): string
{
    $secret = app_config('CUSTOMER_AUTH_SECRET');
    if (!$secret || strlen($secret) < 32) {
        throw new RuntimeException('CUSTOMER_AUTH_SECRET must be set to at least 32 characters.');
    }

    return $secret;
}

function customer_bearer_token(): ?string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $headers['Authorization'] ?? '';
    if ($authorization === '') {
        return null;
    }
    if (!is_string($authorization) || !preg_match('/^Bearer ([a-f0-9]{64})$/i', $authorization, $matches)) {
        send_json(['error' => 'Customer session is invalid. Sign in again.'], 401);
    }

    return strtolower($matches[1]);
}

function customer_for_token(string $token): array
{
    $tokenHash = hash('sha256', $token);
    $statement = database()->prepare(
        '        SELECT c.id, c.first_name AS firstName, c.last_name AS lastName,
                c.phone, c.password_setup_required AS passwordSetupRequired,
                c.created_at AS createdAt, s.token_hash
         FROM customer_sessions s
         INNER JOIN customers c ON c.id = s.customer_id
         WHERE s.token_hash = :token_hash AND s.expires_at > UTC_TIMESTAMP()
         LIMIT 1'
    );
    $statement->execute(['token_hash' => $tokenHash]);
    $customer = $statement->fetch();
    if (!$customer) {
        send_json(['error' => 'Your customer session has expired. Sign in again.'], 401);
    }

    $touch = database()->prepare(
        'UPDATE customer_sessions SET last_used_at = UTC_TIMESTAMP() WHERE token_hash = :token_hash'
    );
    $touch->execute(['token_hash' => $tokenHash]);
    $customer['id'] = (int) $customer['id'];
    $customer['passwordSetupRequired'] = (bool) $customer['passwordSetupRequired'];
    unset($customer['token_hash']);

    return $customer;
}

function require_customer(): array
{
    $token = customer_bearer_token();
    if ($token === null) {
        send_json(['error' => 'Customer sign-in is required.'], 401);
    }

    return customer_for_token($token);
}

function optional_customer(): ?array
{
    $token = customer_bearer_token();
    return $token === null ? null : customer_for_token($token);
}

function customer_auth_rate_limit(PDO $pdo, string $phone): void
{
    $secret = customer_auth_secret();
    if (random_int(1, 100) === 1) {
        $pdo->exec(
            'DELETE FROM customer_auth_limits
             WHERE window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)'
        );
        $pdo->exec('DELETE FROM customer_sessions WHERE expires_at < UTC_TIMESTAMP()');
    }

    $remoteAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    $identifiers = ['phone:' . $phone];
    if (is_string($remoteAddress) && $remoteAddress !== '') {
        $identifiers[] = 'ip:' . $remoteAddress;
    }

    foreach ($identifiers as $identifier) {
        $bucketHash = hash_hmac('sha256', $identifier, $secret);
        $statement = $pdo->prepare(
            'INSERT INTO customer_auth_limits (bucket_hash, window_started_at, attempts)
             VALUES (:bucket_hash, UTC_TIMESTAMP(), 1)
             ON DUPLICATE KEY UPDATE
               attempts = IF(
                 window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE),
                 1,
                 attempts + 1
               ),
               window_started_at = IF(
                 window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE),
                 UTC_TIMESTAMP(),
                 window_started_at
               )'
        );
        $statement->execute(['bucket_hash' => $bucketHash]);

        $attemptStatement = $pdo->prepare(
            'SELECT attempts FROM customer_auth_limits WHERE bucket_hash = :bucket_hash'
        );
        $attemptStatement->execute(['bucket_hash' => $bucketHash]);
        if ((int) $attemptStatement->fetchColumn() > 12) {
            header('Retry-After: 900');
            send_json(['error' => 'Too many requests. Try again in 15 minutes.'], 429);
        }
    }
}

function create_customer_session(PDO $pdo, int $customerId): string
{
    $token = bin2hex(random_bytes(32));
    $statement = $pdo->prepare(
        'INSERT INTO customer_sessions (customer_id, token_hash, expires_at)
         VALUES (:customer_id, :token_hash, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY))'
    );
    $statement->execute([
        'customer_id' => $customerId,
        'token_hash' => hash('sha256', $token),
    ]);

    return $token;
}

function customer_auth_response(PDO $pdo, int $customerId): array
{
    $statement = $pdo->prepare(
        'SELECT id, first_name AS firstName, last_name AS lastName, phone,
                password_setup_required AS passwordSetupRequired, created_at AS createdAt
         FROM customers WHERE id = :id LIMIT 1'
    );
    $statement->execute(['id' => $customerId]);
    $customer = $statement->fetch();
    if (!$customer) {
        throw new RuntimeException('The customer account could not be loaded after sign-in.');
    }
    $customer['id'] = (int) $customer['id'];
    $customer['passwordSetupRequired'] = (bool) $customer['passwordSetupRequired'];

    return $customer;
}

function customer_name_part(string $value): string
{
    $characters = preg_split('//u', $value, -1, PREG_SPLIT_NO_EMPTY);
    if (!is_array($characters)) {
        return substr($value, 0, 60);
    }

    return implode('', array_slice($characters, 0, 60));
}

function create_order_customer_session(PDO $pdo, int $orderId, array $details): ?array
{
    $phoneValue = $details['phone'] ?? '';
    $phone = is_string($phoneValue) ? (string) preg_replace('/\D+/', '', $phoneValue) : '';
    if (strlen($phone) === 12 && str_starts_with($phone, '91')) {
        $phone = substr($phone, 2);
    }
    if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
        return null;
    }

    $existingCustomer = $pdo->prepare('SELECT id FROM customers WHERE phone = :phone LIMIT 1');
    $existingCustomer->execute(['phone' => $phone]);
    if ($existingCustomer->fetchColumn() !== false) {
        return null;
    }

    customer_auth_rate_limit($pdo, $phone);

    $fullName = trim((string) ($details['name'] ?? ''));
    $nameParts = preg_split('/\s+/u', $fullName, 2);
    $firstName = customer_name_part((string) ($nameParts[0] ?? 'Customer'));
    $lastName = customer_name_part((string) ($nameParts[1] ?? ''));
    $temporaryPasswordHash = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);
    if (!is_string($temporaryPasswordHash)) {
        throw new RuntimeException('Customer password could not be securely initialized.');
    }

    try {
        $insertCustomer = $pdo->prepare(
            'INSERT INTO customers
               (first_name, last_name, phone, password_hash, password_setup_required, password_setup_order_id)
             VALUES
               (:first_name, :last_name, :phone, :password_hash, 1, :order_id)'
        );
        $insertCustomer->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $phone,
            'password_hash' => $temporaryPasswordHash,
            'order_id' => $orderId,
        ]);
    } catch (PDOException $exception) {
        if (($exception->errorInfo[1] ?? null) === 1062) {
            return null;
        }
        throw $exception;
    }

    $customerId = (int) $pdo->lastInsertId();
    $insertAddress = $pdo->prepare(
        'INSERT INTO customer_addresses
           (customer_id, label, recipient_name, phone, address, city, pincode, is_default)
         VALUES
           (:customer_id, :label, :recipient_name, :phone, :address, :city, :pincode, 1)'
    );
    $insertAddress->execute([
        'customer_id' => $customerId,
        'label' => 'Home',
        'recipient_name' => $fullName,
        'phone' => $details['phone'],
        'address' => $details['address'],
        'city' => $details['city'],
        'pincode' => $details['pincode'],
    ]);

    $linkOrder = $pdo->prepare(
        'UPDATE orders SET customer_id = :customer_id WHERE id = :order_id AND customer_id IS NULL'
    );
    $linkOrder->execute(['customer_id' => $customerId, 'order_id' => $orderId]);
    if ($linkOrder->rowCount() !== 1) {
        throw new RuntimeException('The new customer account could not be linked to its order.');
    }

    return [
        'token' => create_customer_session($pdo, $customerId),
        'customer' => customer_auth_response($pdo, $customerId),
    ];
}
