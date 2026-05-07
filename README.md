# Lumina Coffee Roasters SaaS

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/shalini355/Lumina-coffee-saas)

Lumina Coffee Roasters is a production-ready coffee subscription SaaS built with React, Vite, Tailwind CSS, and Express. It includes a marketing site, dynamic content API, authentication, protected customer dashboard, subscription management, lead capture, and billing-ready endpoints.

## Features

- Premium coffee subscription landing page
- Dynamic website content from `content/site-content.json`
- Signup, login, logout, and session restore
- HttpOnly signed session cookies
- Salted `scrypt` password hashing
- Protected customer dashboard
- Subscription creation, pause, resume, and cancel actions
- Demo billing mode out of the box
- Stripe Checkout-ready endpoint when Stripe env vars are configured
- Admin metrics for the first registered user
- Contact, newsletter, and subscription lead capture
- Docker and Render deployment support

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS 4
- Express
- Node.js 20+
- Motion
- Lucide React

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Create an account from the navbar. The first user to sign up becomes the `admin`; later users become `customer` accounts.

Example password:

```text
Password123
```

Passwords must include at least 8 characters, one letter, and one number.

## Environment Variables

Create a `.env` file from `.env.example`.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Required or recommended values:

```env
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
APP_SECRET=replace_with_at_least_32_random_characters
CORS_ALLOWED_ORIGIN=http://localhost:3000
DATA_DIR=./data
LEAD_NOTIFICATION_WEBHOOK_URL=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
```

Without Stripe variables, the app runs in demo billing mode.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run start
npm run preview
```

- `dev` runs Express with Vite middleware.
- `typecheck` validates client and server TypeScript.
- `build` compiles the production client and server.
- `start` runs the compiled production server.
- `preview` runs the compiled server locally with `NODE_ENV=production`.

## Dynamic Content

Most website copy and visual content lives in:

```text
content/site-content.json
```

You can edit:

- Hero copy and CTA text
- Menu items and prices
- Subscription plans
- Feature cards
- Gallery images
- Reviews
- Contact information
- Footer text and social links

Restart the server after editing this file locally.

## API Overview

Health and content:

- `GET /healthz`
- `GET /api/site-content`

Authentication:

- `GET /api/auth/me`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

SaaS dashboard:

- `GET /api/saas/dashboard`
- `POST /api/saas/subscriptions`
- `PATCH /api/saas/subscriptions/:id`

Billing:

- `POST /api/billing/checkout`
- `POST /api/billing/customer-portal`

Admin:

- `GET /api/admin/metrics`

Lead capture:

- `POST /api/orders`
- `POST /api/contact`
- `POST /api/newsletter`

## Storage

The app uses file-backed storage so it works locally and deploys simply:

- `DATA_DIR/users.json`
- `DATA_DIR/subscriptions.json`
- `DATA_DIR/billing-sessions.json`
- `DATA_DIR/contact.jsonl`
- `DATA_DIR/order-request.jsonl`
- `DATA_DIR/newsletter.jsonl`

For high-volume production SaaS usage, replace file storage with Postgres, MySQL, MongoDB, or a managed auth/database provider.

## Billing

The app ships with demo billing mode.

To enable real Stripe Checkout, configure:

```env
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_PRICE_ID=price_xxxxxxxxx
```

Then redeploy or restart the server.

## Docker

```bash
docker build -t lumina-coffee-roasters .
docker run --env-file .env -p 8080:8080 lumina-coffee-roasters
```

## Render Deployment

This repository includes `render.yaml`.

1. Push the repository to GitHub.
2. Create a Render Blueprint from the repository.
3. Set `APP_URL` to your deployed URL.
4. Set `APP_SECRET` to a long random value.
5. Optionally set Stripe and webhook variables.
6. Attach persistent storage if you keep file-backed storage.

## Production Notes

This project is deployable as a SaaS starter. Before using it for serious production traffic, consider adding:

- Managed database
- Email verification and password reset
- Stripe webhook handling
- Rate limiting
- Audit logs
- Automated tests
- Privacy Policy and Terms pages

## License

This project is licensed under the MIT License.
