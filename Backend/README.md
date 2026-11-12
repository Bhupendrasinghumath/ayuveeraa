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
- `API_ALLOWED_ORIGINS`: comma-separated frontend origins, for example
  `https://your-store.example,https://www.your-store.example`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Razorpay API credentials. Keep
  the secret on the PHP server only; the public Key ID is returned to checkout.
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
   `razorpay_migration.sql` once; it adds online-payment fields and a
   pending-payment order status. Do not re-import the full SQL dump on an
   existing store.
2. Set the environment variables above in the PHP hosting panel (or create
   `config.local.php` from the example if environment variables are unavailable).
   Generate a
   password hash on the PHP server with
   `php -r "echo password_hash('choose-a-strong-password', PASSWORD_DEFAULT), PHP_EOL;"`
   and use that output as `ADMIN_PASSWORD_HASH`. Generate
   `ADMIN_TOKEN_SECRET` with a secure random generator; do not reuse the DB
   password or commit any of these values.
3. Add product records in the database; the storefront reads only active rows
   from the `products` table. To add the bundled demo catalog, sign in to the
   admin panel and choose **Import demo products**. The protected import skips
   matching names and does not overwrite existing products. Alternatively, run
   `php seed_products.php` from the Backend folder in Hostinger Terminal, or
   import `products_demo_import.sql` in phpMyAdmin's SQL tab. The SQL import
   creates the products table if needed and skips matching demo product names.
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
   `Backend/api/razorpay.php`, `Backend/api/verify-payment.php`,
   `Backend/api/payment-failed.php`, `Backend/api/razorpay-webhook.php`, and
   `Backend/config.local.example.php`. Keep migration SQL in your local project
   for database import; it does not need to be published in `public_html`.
4. In phpMyAdmin, select the exact database configured as `DB_NAME` and run
   `Backend/razorpay_migration.sql` once using **Import** or the SQL tab. Do not
   re-import the full SQL dump on an existing store.
5. In File Manager, create `Backend/uploads/products` if it does not exist.
   Ensure the PHP process can write to this directory (normally 755; use
   Hostinger's ownership/permission tools rather than making it world-writable).
   Keep `Backend/uploads/.htaccess` in place to disable directory listing and
   block executable upload extensions.
6. Create `Backend/config.local.php` from the local example, fill the Hostinger
   database details, set `API_ALLOWED_ORIGINS` to the exact frontend origin
   (the origin has no path, e.g. `https://thehillston.com`), and configure the
   admin fields. Do not upload a file with real credentials under the
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

- `GET /products.php` — active catalog; accepts `?category=Hair%20Care`.
- `GET /products.php?id=1` — one product.
- `POST /orders.php` — creates a COD order or a pending Razorpay order and
  item snapshots. The server recalculates totals from active database products;
  client prices are ignored.
- `POST /verify-payment.php` — verifies and captures a Razorpay payment before
  confirming the order.
- `POST /payment-failed.php` — records a dismissed or failed checkout attempt.
- `POST /razorpay-webhook.php` — validates Razorpay payment events using the
  configured webhook signature.
- `POST /contact.php` — saves a validated contact message.
- `POST /admin-auth.php` — admin sign-in; returns an eight-hour signed token.
- `GET /admin-auth.php` — verifies an admin token.
- `/admin.php?resource=products` — admin product list/create/edit/activate.
  Existing JSON requests with an HTTP(S) `image` URL remain supported.
  Multipart requests accept `images[]` (1–6 JPEG, PNG, or WebP files, max 5 MB
  each). Creating a product with multipart data requires at least one image.
  On edit, omitting `images[]` preserves the current gallery; supplying it
  replaces the full gallery.
- `/admin.php?resource=orders` — latest 200 orders and status updates.
- `/admin.php?resource=messages` — latest 200 contact messages and status updates.
- `POST /admin.php?resource=seed-demo` — imports missing demo products (admin token required).

Admin requests send the token as `Authorization: Bearer <token>`. Products are
hidden by deactivation rather than deleted, so historic order items stay intact.

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

For online checkout, set `"payment": "RAZORPAY"`; the backend calculates the
amount, creates the provider order, and verifies the signed payment before
confirming the order.

OTP login is not included; it requires an SMS provider and server-side
OTP/rate-limit handling. Add HTTPS and request rate-limiting at the hosting/
proxy layer before production use.
