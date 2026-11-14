<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $productIdValue = $_GET['product_id'] ?? null;
    $productId = is_string($productIdValue)
        ? filter_var($productIdValue, FILTER_VALIDATE_INT)
        : false;
    if ($productId === false || $productId === null || $productId < 1) {
        send_json(['error' => 'A valid product_id is required.'], 400);
    }

    $pageValue = $_GET['page'] ?? '1';
    $page = is_string($pageValue) ? filter_var($pageValue, FILTER_VALIDATE_INT) : false;
    if ($page === false || $page === null || $page < 1 || $page > 100000) {
        send_json(['error' => 'The review page is invalid.'], 400);
    }

    $sort = $_GET['sort'] ?? 'newest';
    $sortOrders = [
        'newest' => 'created_at DESC, id DESC',
        'highest' => 'rating DESC, created_at DESC, id DESC',
        'lowest' => 'rating ASC, created_at DESC, id DESC',
    ];
    if (!is_string($sort) || !isset($sortOrders[$sort])) {
        send_json(['error' => 'The review sort option is invalid.'], 400);
    }

    $pdo = database();
    $productStatement = $pdo->prepare('SELECT 1 FROM products WHERE id = :id AND is_active = 1');
    $productStatement->execute(['id' => $productId]);
    if (!$productStatement->fetchColumn()) {
        send_json(['error' => 'Product not found.'], 404);
    }

    $summaryStatement = $pdo->prepare(
        'SELECT COUNT(*) AS reviewCount, AVG(rating) AS averageRating
         FROM product_reviews WHERE product_id = :product_id'
    );
    $summaryStatement->execute(['product_id' => $productId]);
    $summary = $summaryStatement->fetch();
    $reviewCount = (int) $summary['reviewCount'];
    $ratingCounts = ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0];

    $ratingStatement = $pdo->prepare(
        'SELECT rating, COUNT(*) AS count
         FROM product_reviews WHERE product_id = :product_id
         GROUP BY rating'
    );
    $ratingStatement->execute(['product_id' => $productId]);
    foreach ($ratingStatement->fetchAll() as $row) {
        $ratingCounts[(string) (int) $row['rating']] = (int) $row['count'];
    }

    $perPage = 20;
    $offset = ($page - 1) * $perPage;
    $reviewsQuery = 'SELECT id, reviewer_name AS reviewerName, rating, title,
                            review_text AS reviewText, created_at AS createdAt
                     FROM product_reviews
                     WHERE product_id = :product_id
                     ORDER BY ' . $sortOrders[$sort] . '
                     LIMIT :limit OFFSET :offset';
    $reviewsStatement = $pdo->prepare($reviewsQuery);
    $reviewsStatement->bindValue(':product_id', $productId, PDO::PARAM_INT);
    $reviewsStatement->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $reviewsStatement->bindValue(':offset', $offset, PDO::PARAM_INT);
    $reviewsStatement->execute();
    $reviews = $reviewsStatement->fetchAll();
    foreach ($reviews as &$review) {
        $review['id'] = (int) $review['id'];
        $review['rating'] = (int) $review['rating'];
        $review['verifiedPurchase'] = true;
    }
    unset($review);

    send_json([
        'data' => [
            'reviews' => $reviews,
            'summary' => [
                'reviewCount' => $reviewCount,
                'averageRating' => $reviewCount > 0 ? round((float) $summary['averageRating'], 2) : 0,
                'ratingCounts' => $ratingCounts,
            ],
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => (int) ceil($reviewCount / $perPage),
        ],
    ]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST, OPTIONS');
    send_json(['error' => 'Method not allowed.'], 405);
}

require __DIR__ . '/customer-security.php';
$customer = require_customer();
$body = read_json_body();
$productIdValue = $body['productId'] ?? null;
$orderIdValue = $body['orderId'] ?? null;
$ratingValue = $body['rating'] ?? null;
$productId = is_int($productIdValue) || is_string($productIdValue)
    ? filter_var($productIdValue, FILTER_VALIDATE_INT)
    : false;
$orderId = is_int($orderIdValue) || is_string($orderIdValue)
    ? filter_var($orderIdValue, FILTER_VALIDATE_INT)
    : false;
$rating = is_int($ratingValue) || is_string($ratingValue)
    ? filter_var($ratingValue, FILTER_VALIDATE_INT)
    : false;
$title = required_string($body, 'title', 120);
$reviewText = required_string($body, 'reviewText', 2000);

if ($productId === false || $productId === null || $productId < 1) {
    send_json(['error' => 'A valid product is required.'], 422);
}
if ($orderId === false || $orderId === null || $orderId < 1) {
    send_json(['error' => 'A valid account order is required.'], 422);
}
if ($rating === false || $rating === null || $rating < 1 || $rating > 5) {
    send_json(['error' => 'Choose a rating from 1 to 5 stars.'], 422);
}
if (strlen($reviewText) < 5) {
    send_json(['error' => 'Review should contain at least 5 characters.'], 422);
}

$pdo = database();
$purchaseStatement = $pdo->prepare(
    "SELECT c.first_name
     FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id AND p.is_active = 1
     INNER JOIN customers c ON c.id = o.customer_id
     WHERE o.id = :order_id
       AND o.customer_id = :customer_id
       AND oi.product_id = :product_id
       AND o.status = 'delivered'
       AND (o.payment_method <> 'RAZORPAY' OR o.payment_status = 'paid')
     LIMIT 1"
);
$purchaseStatement->execute([
    'order_id' => $orderId,
    'customer_id' => $customer['id'],
    'product_id' => $productId,
]);
$purchase = $purchaseStatement->fetch();
if (!$purchase) {
    send_json([
        'error' => 'A delivered order for this product in your account is required to submit a review.',
    ], 403);
}

$reviewerName = (string) $purchase['first_name'];

$insertStatement = $pdo->prepare(
    'INSERT INTO product_reviews (product_id, order_id, reviewer_name, rating, title, review_text)
     VALUES (:product_id, :order_id, :reviewer_name, :rating, :title, :review_text)'
);
try {
    $insertStatement->execute([
        'product_id' => $productId,
        'order_id' => $orderId,
        'reviewer_name' => $reviewerName,
        'rating' => $rating,
        'title' => $title,
        'review_text' => $reviewText,
    ]);
} catch (PDOException $exception) {
    if (($exception->errorInfo[1] ?? null) === 1062) {
        send_json(['error' => 'A review for this product has already been submitted for this order.'], 409);
    }
    throw $exception;
}

send_json(['data' => ['created' => true]], 201);
