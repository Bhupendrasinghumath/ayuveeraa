<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_method('POST');

$body = read_json_body();
$name = required_string($body, 'name', 120);
$email = required_string($body, 'email', 254);
$subject = required_string($body, 'subject', 200);
$message = required_string($body, 'message', 5000);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['error' => 'Enter a valid email address.'], 422);
}

$statement = database()->prepare(
    'INSERT INTO contact_messages (name, email, subject, message)
     VALUES (:name, :email, :subject, :message)'
);
$statement->execute([
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
]);

send_json(['data' => ['submitted' => true]], 201);
