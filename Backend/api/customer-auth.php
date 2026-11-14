<?php
declare(strict_types=1);

require __DIR__ . '/customer-security.php';

header('Cache-Control: no-store');
header('Vary: Authorization');
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    send_json(['data' => ['customer' => require_customer()]]);
}

if ($method === 'DELETE') {
    $token = customer_bearer_token();
    if ($token === null) {
        send_json(['error' => 'Customer sign-in is required.'], 401);
    }
    customer_for_token($token);
    $statement = database()->prepare('DELETE FROM customer_sessions WHERE token_hash = :token_hash');
    $statement->execute(['token_hash' => hash('sha256', $token)]);
    send_json(['data' => ['signedOut' => true]]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST, DELETE, OPTIONS');
    send_json(['error' => 'Method not allowed.'], 405);
}

$body = read_json_body();
$action = $body['action'] ?? null;
if (!is_string($action) || !in_array($action, ['register', 'login'], true)) {
    send_json(['error' => 'Choose register or login.'], 422);
}

$phoneValue = required_string($body, 'phone', 24);
$phone = (string) preg_replace('/\D+/', '', $phoneValue);
if (strlen($phone) === 12 && str_starts_with($phone, '91')) {
    $phone = substr($phone, 2);
}
if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    send_json(['error' => 'Enter a valid 10-digit Indian mobile number.'], 422);
}

$password = $body['password'] ?? null;
if (!is_string($password) || strlen($password) < 10 || strlen($password) > 72) {
    send_json(['error' => 'Password must be 10 to 72 characters long.'], 422);
}

$pdo = database();
customer_auth_rate_limit($pdo, $phone);

if ($action === 'register') {
    $firstName = required_string($body, 'firstName', 60);
    $lastName = required_string($body, 'lastName', 60);
    if (preg_match('/[\x00-\x1F\x7F]/', $firstName . $lastName)) {
        send_json(['error' => 'Names contain invalid characters.'], 422);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    if (!is_string($passwordHash)) {
        throw new RuntimeException('Customer password could not be securely hashed.');
    }

    $pdo->beginTransaction();
    try {
        $statement = $pdo->prepare(
            'INSERT INTO customers (first_name, last_name, phone, password_hash)
             VALUES (:first_name, :last_name, :phone, :password_hash)'
        );
        $statement->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $phone,
            'password_hash' => $passwordHash,
        ]);
        $customerId = (int) $pdo->lastInsertId();
        $token = create_customer_session($pdo, $customerId);
        $customer = customer_auth_response($pdo, $customerId);
        $pdo->commit();
    } catch (PDOException $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (($exception->errorInfo[1] ?? null) === 1062) {
            send_json(['error' => 'An account already exists for this mobile number. Sign in instead.'], 409);
        }
        throw $exception;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
    send_json([
        'data' => [
            'token' => $token,
            'expiresIn' => 30 * 24 * 60 * 60,
            'customer' => $customer,
        ],
    ], 201);
} else {
    $statement = $pdo->prepare(
        'SELECT id, password_hash FROM customers WHERE phone = :phone LIMIT 1'
    );
    $statement->execute(['phone' => $phone]);
    $account = $statement->fetch();
    if (!$account || !password_verify($password, (string) $account['password_hash'])) {
        send_json(['error' => 'Mobile number or password is incorrect.'], 401);
    }

    if (password_needs_rehash((string) $account['password_hash'], PASSWORD_DEFAULT)) {
        $newPasswordHash = password_hash($password, PASSWORD_DEFAULT);
        if (!is_string($newPasswordHash)) {
            throw new RuntimeException('Customer password could not be securely updated.');
        }
        $update = $pdo->prepare('UPDATE customers SET password_hash = :hash WHERE id = :id');
        $update->execute(['hash' => $newPasswordHash, 'id' => (int) $account['id']]);
    }
    $customerId = (int) $account['id'];
}

$token = create_customer_session($pdo, $customerId);
$customer = customer_auth_response($pdo, $customerId);
send_json([
    'data' => [
        'token' => $token,
        'expiresIn' => 30 * 24 * 60 * 60,
        'customer' => $customer,
    ],
]);
