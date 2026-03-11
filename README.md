# Charity Golf Outing Backend (Express + Prisma + Stripe)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Create Postgres database and set `DATABASE_URL`.
3. Run migrations + seed:

```bash
npm run prisma:migrate
npm run seed
```

4. Start dev server:

```bash
npm run dev
```

## Public API

- `GET /packages`
- `POST /registrations`
- `GET /registrations/:id`
- `POST /payments/create`
- `POST /payments/webhook` (Stripe)

## Admin API (JWT)

- `POST /admin/login`
- `GET /admin/registrations?category=GOLF&status=PAID&page=1&pageSize=25`
- `GET /admin/payments`
- `GET /admin/sponsors`
- `GET /admin/golfers` (add `?format=csv` for CSV export)

