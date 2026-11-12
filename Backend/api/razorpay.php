<?php
declare(strict_types=1);

function razorpay_request(string $method, string $path, ?array $payload = null): array
{
    $keyId = app_config('RAZORPAY_KEY_ID');
    $keySecret = app_config('RAZORPAY_KEY_SECRET');
    if (!$keyId || !$keySecret) {
        send_json(['error' => 'Online payment is not configured.'], 503);
    }
    if (!function_exists('curl_init')) {
        send_json(['error' => 'Online payment is temporarily unavailable on this server.'], 503);
    }

    $curl = curl_init('https://api.razorpay.com/v1' . $path);
    if ($curl === false) {
        send_json(['error' => 'Payment gateway is temporarily unavailable. Please try again.'], 502);
    }

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_USERPWD => $keyId . ':' . $keySecret,
        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ];
    if ($payload !== null) {
        $options[CURLOPT_POSTFIELDS] = json_encode($payload, JSON_THROW_ON_ERROR);
    }
    curl_setopt_array($curl, $options);
    $responseBody = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    $response = is_string($responseBody) ? json_decode($responseBody, true) : null;
    if ($status < 200 || $status >= 300 || !is_array($response)) {
        error_log('Razorpay API request failed with HTTP status ' . $status . '.');
        send_json(['error' => 'Payment gateway is temporarily unavailable. Please try again.'], 502);
    }

    return $response;
}

function razorpay_capture_and_verify(
    string $paymentId,
    string $gatewayOrderId,
    int $expectedAmount
): array {
    $payment = razorpay_request('GET', '/payments/' . rawurlencode($paymentId));
    if (
        ($payment['order_id'] ?? null) !== $gatewayOrderId
        || ($payment['amount'] ?? null) !== $expectedAmount
        || ($payment['currency'] ?? null) !== 'INR'
    ) {
        send_json(['error' => 'Payment details do not match this order.'], 422);
    }

    if (($payment['status'] ?? null) === 'authorized') {
        $payment = razorpay_request('POST', '/payments/' . rawurlencode($paymentId) . '/capture', [
            'amount' => $expectedAmount,
            'currency' => 'INR',
        ]);
    }

    if (
        ($payment['order_id'] ?? null) !== $gatewayOrderId
        || ($payment['amount'] ?? null) !== $expectedAmount
        || ($payment['currency'] ?? null) !== 'INR'
        || ($payment['status'] ?? null) !== 'captured'
    ) {
        send_json(['error' => 'Payment has not been captured yet. Please wait a moment and retry.'], 409);
    }

    return $payment;
}
