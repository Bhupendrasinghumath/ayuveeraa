# Core PHP API

This folder contains a small PHP 8.1+ / MySQL API for the React storefront.
It does not include database credentials. Configure these environment variables
in the PHP hosting panel (recommended):

- `DB_HOST`: MySQL host (often `localhost` on shared hosting)
- `DB_NAME`: database name
- `DB_USER`: database username
- `DB_PASS`: database password
- `ADMIN_USERNAME`: private administrator username
- `ADMIN_PASSWORD_HASH`: password hash generated with PHP `password_hash()`
- `ADMIN_TOKEN_SECRET`: random secret of at least 32 characters for signing
  short-lived admin access tokens
- `CUSTOMER_AUTH_SECRET`: separate private random secret of at least 32
  characters for customer authentication rate-limit buckets
- `API_ALLOWED_ORIGINS`: comma-separated frontend origins, for example
  `https://your-store.example,https://www.your-store.example`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Razorpay API credentials used
  for COD advances and full online checkout. Keep the secret on the PHP server
  only; the public Key ID is returned to checkout.
- `RAZORPAY_WEBHOOK_SECRET`: the secret configured for the Razorpay webhook.
- `API_PUBLIC_BASE_URL` (optional): public backend base URL without `/api`,
  for example `https://your-store.example/Backend`. Set this when uploaded
  images should be served from a different host or the API is behind a proxy.

Keep the database user limited to this database. Never put database credentials
in React code, a `VITE_*` variable, or a public repository.

If the PHP hosting panel does not support environment variables, copy
`config.local.example.php` to `config.local.php`, enter the actual values in that
server-side file, and upload it inside the `Backend` directory. Do not upload
real values in the example file or commit `config.local.php`; it is git-ignored
and `.htaccess` denies direct web access to it. On Hostinger, open hPanel >
Databases > Management, copy the exact MySQL database name, username, and host
(including any account prefix), and use the database password set in that panel.
The host is shown in Hostinger's database details; do not assume the website
domain is the database host. If the password was shared in chat, rotate it in
hPanel and put the new password in `config.local.php`.

## Setup

1. Use the existing MySQL database and confirm that its `orders` and
   `order_items` tables match the current store schema. For a fresh install,
   import `u895224968_Ayuveera.sql`. For an existing database, run
   `razorpay_migration.sql` once if it has not already been applied, then run
   `contact_phone_migration.sql` once. Fresh installs already include the
   contact phone column in the SQL dump. After the
   base `products` and `orders` tables exist, if `product_reviews` is missing,
   create it using only the initial `CREATE TABLE product_reviews` statement in
   `product_reviews_migration.sql`; do not execute the synthetic test-order and
   review seed blocks later in that file. Run
   `customer_accounts_migration.sql` once after the base tables exist, then
   `customer_order_account_migration.sql` once, followed by
   `cod_advance_online_discount_migration.sql` and
   `admin_commerce_migration.sql` once each. The payment migration backfills
   existing delivered COD orders as fully paid. The commerce migration seeds
   categories and the current 10% online discount.
   Do not re-import the full SQL dump on an existing store.
2. Set the environment variables above in the PHP hosting panel (or create
   `config.local.php` from the example if environment variables are unavailable).
   Generate a
   password hash on the PHP server with
   `php -r "echo password_hash('choose-a-strong-password', PASSWORD_DEFAULT), PHP_EOL;"`
   and use that output as `ADMIN_PASSWORD_HASH`. Generate
   `ADMIN_TOKEN_SECRET` with a secure random generator; do not reuse the DB
   password or commit any of these values.
3. Add verified product records in the admin panel under **Products**. Complete
   the product details and ingredients, assign an active category, and publish
   the product when it is ready. The storefront reads only active products in
   active categories.
4. Publish this folder on a PHP 8.1+ host with PDO MySQL enabled. For example,
   if it is published at `https://api.example.com/Backend`, its API base URL is
   `https://api.example.com/Backend/api`.
5. The frontend defaults to the production API at
   `https://thehillston.com/Ayuveera/Backend/api`. Set
   `VITE_API_BASE_URL=https://api.example.com/Backend/api` in the frontend
   build environment only when using a different backend, then rebuild and
   redeploy. For local development, set it to
   `http://localhost/Backend/api` (or the local PHP server URL).

### Hostinger deployment checklist

1. In hPanel, open **Databases > Management** and check the database name,
   username, host and assigned privileges. Create a database/user if needed.
   The DB user needs access to the selected database.
2. Open **Databases > phpMyAdmin** and confirm the API tables (`products`,
   `orders`, `order_items`, `contact_messages`) exist in that database. If the
   tables are in a different database, import the current SQL schema into the
   database whose name is configured in `DB_NAME` (use the bundled SQL dump
   only for a fresh database).
3. In **Websites > File Manager**, open the directory that contains
   `Ayuveera/Backend/api/products.php`. It should be under the site's
   `public_html` directory. Upload the updated backend PHP files, including
   `Backend/api/admin.php`, `Backend/api/products.php`,
   `Backend/api/customer-auth.php`, `Backend/api/customer-account.php`,
   `Backend/api/customer-security.php`, `Backend/api/orders.php`,
   `Backend/api/track-order.php`,
   `Backend/api/reviews.php`, `Backend/api/bootstrap.php`,
   `Backend/api/razorpay.php`, `Backend/api/verify-payment.php`,
   `Backend/api/payment-failed.php`, `Backend/api/razorpay-webhook.php`,
   `Backend/api/promotions.php`, `Backend/api/validate-coupon.php`, and
   `Backend/config.local.example.php`. Keep migration SQL in your local project
   for database import; it does not need to be published in `public_html`.
4. In phpMyAdmin, select the exact database configured as `DB_NAME` and run
   `Backend/razorpay_migration.sql` if it has not already been applied, then run
   `Backend/contact_phone_migration.sql` once. If the
   `product_reviews` table is missing, execute only its initial `CREATE TABLE`
   statement from `Backend/product_reviews_migration.sql`. Run
   `Backend/customer_accounts_migration.sql` once, followed by
   `Backend/customer_order_account_migration.sql`,
   `Backend/cod_advance_online_discount_migration.sql`, and
   `Backend/admin_commerce_migration.sql` once each. Do not execute the synthetic
   test-order/review seed blocks or re-import the full SQL dump on an existing
   store.
5. In File Manager, create `Backend/uploads/products` if it does not exist.
   Ensure the PHP process can write to this directory (normally 755; use
   Hostinger's ownership/permission tools rather than making it world-writable).
   Keep `Backend/uploads/.htaccess` in place to disable directory listing and
   block executable upload extensions.
6. Create `Backend/config.local.php` from the local example, fill the Hostinger
   database details, set `API_ALLOWED_ORIGINS` to the exact frontend origin
   (the origin has no path, e.g. `https://thehillston.com`), and configure the
   admin fields. Set `CUSTOMER_AUTH_SECRET` to a separate private value
   generated with `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`. Do not
   upload a file with real credentials under the
   `config.local.example.php` name. The `.htaccess` rule prevents direct web
   reads of `config.local.php`. If the API and uploaded images are served on
   different hostnames or the API is behind a proxy, also set
   `API_PUBLIC_BASE_URL` to the public backend base URL (no trailing slash and
   no `/api` suffix).
7. In Hostinger PHP settings, select PHP 8.1+ and enable PDO MySQL (`pdo_mysql`)
   and Fileinfo. Upload `Backend/.user.ini` alongside the backend so six images
   can fit in one multipart request. It sets `upload_max_filesize = 5M`,
   `max_file_uploads = 6`, `post_max_size = 40M`, and
   `enable_post_data_reading = On` (plus request timeouts).
   If Hostinger does not apply `.user.ini`, set these values in hPanel > PHP
   Configuration: `upload_max_filesize` at least `5M`,
   `max_file_uploads` at least `6`, `post_max_size` at least `40M`, and
   `enable_post_data_reading` to `On` if that setting is available.
   `post_max_size` must be larger than the total size of all selected images
   plus form data. Exceeding the active limit is one cause of PHP leaving
   `$_POST` and `$_FILES` empty; they can also be empty for multipart requests
   that use a method other than POST or when `enable_post_data_reading` is Off.
   Wait several minutes after changing `.user.ini` or PHP settings, then retry.
   Verify the site uses HTTPS.
   If the API reports `MULTIPART_BODY_NOT_PARSED`, check its safe diagnostic
   fields `requestMethod`, `phpPostMaxSize`, and `enablePostDataReading`.
   Use POST for multipart uploads, and verify `.user.ini` has taken effect and
   the hosting proxy forwards the request body. For example, a 1.8 MB request
   with `post_max_size = 2048M` is below the limit and is not a
   `post_max_size` failure. The API reports `UPLOAD_EXCEEDS_SERVER_LIMIT` only
   when the request length is proven to exceed the parsed active limit.
8. To enable admin sign-in, choose a strong admin password and generate its
   hash in Hostinger Terminal with
   `php -r "echo password_hash('YOUR_NEW_ADMIN_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"`.
   Put the resulting hash in `ADMIN_PASSWORD_HASH`. Generate a separate token
   secret with `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"` and put it
   in `ADMIN_TOKEN_SECRET`. Do not reuse the database password as the admin
   password or token secret.
9. To enable online checkout, create Razorpay API keys in the Razorpay
   Dashboard. Start with test-mode keys; set `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET` only in the PHP host environment or private
   `Backend/config.local.php`. Never add the secret to a `VITE_*` setting or
   frontend source. Configure a Razorpay webhook at
   `https://thehillston.com/Ayuveera/Backend/api/razorpay-webhook.php` for the
   `payment.captured` and `payment.failed` events, and set its signing secret
   as `RAZORPAY_WEBHOOK_SECRET` on the PHP host. Test with Razorpay test cards
   before switching to live-mode credentials.
10. Test `https://thehillston.com/Ayuveera/Backend/api/products.php` directly.
   It should return JSON with a `data` array (an empty array means no active
   product rows). If it returns an error, inspect the site's PHP error log in
   hPanel; never enable public PHP error display on a live site.
11. The frontend's production API default is
   `https://thehillston.com/Ayuveera/Backend/api`. If Vercel has an explicit
   `VITE_API_BASE_URL` override, ensure it uses that backend API URL (not the
   Vercel frontend URL) and redeploy. Vite environment variables are build-time
   settings; changing them without a new deployment will not update the
   deployed JavaScript.

The production frontend origin must be included exactly in
`API_ALLOWED_ORIGINS`. The default origins are for local Vite development only.
Apply HTTPS and rate limiting to the admin sign-in endpoint at the web server or
hosting proxy. Admin access tokens expire after eight hours and are held in the
browser tab's session storage. The API can use a separate host, provided its
`API_ALLOWED_ORIGINS` includes the exact frontend origin.

## Endpoints

- `GET /products.php` — active catalog; accepts a category slug such as
  `?category=hair-care`.
- `GET /products.php?id=1` — one product.
- `GET /reviews.php?product_id=1&page=1` — genuine reviews and rating totals for an active product.
- `POST /reviews.php` — saves one 1–5 star review per delivered product/order
  owned by the authenticated customer. JSON fields: `productId`, `orderId`,
  `rating`, `title`, and `reviewText`.
- `POST /orders.php` — creates a pending COD or online order and item snapshots.
  The server recalculates totals from active products and current promotions;
  client prices and discount amounts are ignored. COD requires an online
  advance of up to ₹99 (capped at the order total), with the remaining balance
  due on delivery. Full online payment gets the configured percentage discount;
  an active coupon can stack on the remaining total and applies to online
  payments only. A guest order creates an account only after the COD
  advance or full online payment is verified; the new account contains only
  that order and checkout address.
- `GET /promotions.php` — current online payment discount and active coupon
  selected for the storefront offer banner.
- `POST /validate-coupon.php` — checks an active coupon for full online payment.
- `POST /track-order.php` — finds an order using its order number and checkout
  phone number, then returns its status, payment state, subtotal, discount,
  total, amount paid, balance due, date, and item summary. It is rate-limited
  and does not return the delivery address or customer contact details.
  Requires the customer account and COD payment migrations and
  `CUSTOMER_AUTH_SECRET`.
- `POST /customer-auth.php` — register or sign in with an Indian mobile number
  and password. Passwords are hashed on the server; access tokens are random,
  stored hashed in MySQL, and expire after 30 days. `GET` validates a token;
  `DELETE` revokes the current session.
- `GET /customer-account.php` — authenticated profile, account-owned orders,
  saved addresses, wishlist products, and delivered-order review eligibility.
  `PATCH` updates profile/password, `POST` creates an address or saves a
  wishlist product, and `DELETE` removes an owned address or wishlist item.
- `POST /verify-payment.php` — verifies the Razorpay payment amount and
  signature; confirms COD orders after the advance and online orders after
  full discounted payment.
- `POST /payment-failed.php` — records a dismissed or failed checkout attempt.
- `POST /razorpay-webhook.php` — validates Razorpay payment events using the
  configured webhook signature.
- `POST /contact.php` — saves a validated contact message.
- `POST /admin-auth.php` — admin sign-in; returns an eight-hour signed token.
- `GET /admin-auth.php` — verifies an admin token.
- `/admin.php?resource=products` — admin product list/create/edit/activate.
  Product forms include the existing detail fields and ingredient rows.
  Existing JSON requests with an HTTP(S) `image` URL remain supported.
  Multipart requests accept `images[]` (1–6 JPEG, PNG, or WebP files, max 5 MB
  each). Creating a product with multipart data requires at least one image.
  On edit, omitting `images[]` preserves the current gallery; supplying it
  replaces the full gallery.
- `/admin.php?resource=categories` — admin category list/create/activate. A
  category with active products cannot be deactivated until those products are
  hidden.
- `/admin.php?resource=orders` — latest 200 orders and status updates.
- `/admin.php?resource=customers` — recent customer profiles, saved addresses,
  order counts, and paid totals.
- `/admin.php?resource=promotions` — read/update the configured online discount.
- `/admin.php?resource=coupons` — add, update, activate, and feature percentage
  coupons for the storefront banner.
- `/admin.php?resource=messages` — latest 200 contact messages and status updates.

Admin requests send the token as `Authorization: Bearer <token>`. Products are
hidden by deactivation rather than deleted, so historic order items stay intact.
Customer bearer tokens are stored in the browser tab's session storage and are
never persisted as plaintext in MySQL; do not store customer passwords in the
frontend.

Order and other existing JSON POST requests use `Content-Type: application/json`.
Product gallery uploads use `multipart/form-data`; let the browser set its
boundary rather than setting the content type manually. Order request example:

```json
{
  "name": "Customer Name",
  "phone": "9876543210",
  "address": "Delivery address",
  "city": "Jaipur",
  "pincode": "302001",
  "payment": "COD",
  "items": [{ "id": 1, "qty": 2 }]
}
```

The COD selection charges a ₹99 advance (or the full total when the order is
under ₹99) through Razorpay; the remainder is due on delivery. For full online
checkout, set `"payment": "RAZORPAY"`; the backend applies the configured online
discount and any valid coupon, creates the provider order for the discounted
total, and verifies the signed payment before confirming the order.

OTP login is not included; it requires an SMS provider and server-side
OTP/rate-limit handling. Customer accounts use phone + password instead.
Phone ownership is not verified by checkout. A new guest account contains only
the order placed in that checkout and its delivery address; it is never linked
to an existing account or older orders by phone alone. If the number already
has an account, or is not a valid Indian mobile number, checkout stays as a
guest order and can be tracked with the order number and checkout phone.
Password recovery for an existing account requires identity verification; do
not add a phone-only password reset. The auth API also applies database-backed
phone/IP rate limits. Keep HTTPS enabled and configure additional request
throttling at the hosting/proxy layer.
