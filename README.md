# Dream Drive Auto

A production-grade dealership website with full inventory management, lead capture, financing tools, and automated inventory syndication to AutoTrader, CarGurus, and other listing partners.

Built with Next.js 14 (App Router), TypeScript, Prisma, and Tailwind. Single codebase covering the public storefront, admin console, and the syndication worker.

---

## What's inside

### Public site
- **Home** with cinematic hero, ticker, featured collection, philosophy, services, recent listings.
- **Inventory** with full search, filtering (make, body style, condition, price, year), and sort.
- **Vehicle detail** with gallery, full spec sheet, equipment list, vehicle history, and financing calculator.
- **Financing** pre-qualification application.
- **Trade-In** appraisal request flow.
- **Sell Your Car** outright purchase landing.
- **Service**, **About**, **Contact**, **Privacy**, **Terms**, **404**.
- Fully responsive (mobile + tablet + desktop). Dark editorial aesthetic.

### Admin console (`/admin`)
- Email/password sign-in (NextAuth + bcrypt).
- Dashboard with KPIs and recent activity.
- Inventory CRUD with photo upload, drag-to-reorder, status (available / pending / sold / hidden).
- Leads inbox with type filters, expandable details, click-to-call/email.
- Syndication console: enable channels, trigger runs, review delivery history.
- Settings editor for dealer contact details, hours, homepage copy, about-page copy, contact-page copy, and footer text.

### Backend
- Prisma + PostgreSQL for durable production data.
- REST endpoints for vehicles, leads, uploads, settings, syndication, feeds.
- Lead notifications via SMTP (nodemailer).
- Local image upload with type/size validation.
- Static feed endpoints (HTTPS pull): `/api/feeds/autotrader`, `/api/feeds/cargurus`, `/api/feeds/generic`.

### Inventory syndication
- **AutoTrader** CSV feed generator (standard column spec).
- **CarGurus** TSV feed generator (Inventory Sync v3 spec).
- **Generic XML** feed (vAuto / Homenet compatible) for other aggregators.
- SFTP delivery via `ssh2-sftp-client`.
- Cron worker (`node-cron`) running on configurable schedule.
- One-shot script for manual runs.
- Full audit trail (`SyndicationRun`, `SyndicationItem`).

---

## Important note about AutoTrader & CarGurus

Neither AutoTrader nor CarGurus expose a public REST API for posting inventory.
Dealers integrate by uploading a standardized inventory feed file via SFTP on a schedule.
Their systems pull and ingest the file (typical latency: 1–24 hours).

This codebase produces feeds in their exact specifications and delivers them via SFTP.
You'll plug in dealer-specific credentials once your AutoTrader / CarGurus accounts are
provisioned.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env — at minimum set DATABASE_URL, NEXTAUTH_SECRET, and ADMIN_PASSWORD

# 3. Initialize database
npm run db:migrate   # creates tables from prisma/migrations
npm run db:seed      # local/demo only: seeds admin user + sample vehicles

# 4. Run dev server
npm run dev          # http://localhost:3000
```

Sign in to the admin at `http://localhost:3000/admin/login` with the admin email
and password from `.env` (defaults: `admin@dreamdriveauto.com` / `changeme`).

---

## Configuring syndication

### AutoTrader
1. Coordinate with your AutoTrader dealer rep to be enabled as an Inventory Provider.
2. They will give you SFTP host, username, password, and inbound directory.
3. Set in `.env`:
   ```
   AUTOTRADER_SFTP_HOST=...
   AUTOTRADER_SFTP_USER=...
   AUTOTRADER_SFTP_PASS=...
   AUTOTRADER_SFTP_PATH=/inbound
   AUTOTRADER_DEALER_ID=...
   ```
4. In **Admin → Syndication**, toggle AutoTrader **ON** and **Save**.

### CarGurus
1. Contact CarGurus support to enable third-party inventory feeds.
2. Set in `.env`:
   ```
   CARGURUS_SFTP_HOST=...
   CARGURUS_SFTP_USER=...
   CARGURUS_SFTP_PASS=...
   CARGURUS_SFTP_PATH=/inbound
   CARGURUS_DEALER_ID=...
   ```
3. Toggle CarGurus **ON** in admin.

### Schedule the worker

```bash
npm run syndicate:watch   # long-running cron worker
```

Default schedule: every 6 hours. Override with `SYNDICATION_CRON` (any valid cron).

In production, supervise with PM2, systemd, or run as a Docker container alongside Next.js.

### Manual runs

```bash
npm run syndicate                     # all enabled channels
npm run syndicate -- autotrader       # one channel
npm run syndicate -- --dry-run        # write feeds locally without SFTP delivery
npm run syndicate -- --force          # ignore per-channel "enabled" flag
```

Or trigger from admin: **Admin → Syndication → Run Now**.

### Feed previews

Each channel has an HTTPS preview endpoint that returns the feed in real time:

- `GET /api/feeds/autotrader` – CSV
- `GET /api/feeds/cargurus` – TSV
- `GET /api/feeds/generic` – XML

These can also be configured as the pull source for partners that prefer HTTP-pull over SFTP.

---

## Project structure

```
DreamDriveAuto/
├── prisma/
│   ├── schema.prisma          # Vehicle, Photo, Lead, User, SyndicationRun, Setting
│   └── seed.ts                # Sample inventory + admin bootstrap
├── public/uploads/            # Vehicle photo uploads
├── feeds-output/              # Generated feed files (local copies)
├── scripts/
│   ├── syndicate.ts           # One-shot CLI
│   └── syndication-worker.ts  # Long-running cron worker
└── src/
    ├── app/
    │   ├── (public pages: home, inventory, financing, etc.)
    │   ├── admin/             # Admin console
    │   └── api/               # REST endpoints
    ├── components/            # Header, Footer, VehicleCard, Filters, Gallery, Forms…
    │   └── admin/             # Admin-specific components
    └── lib/
        ├── prisma.ts          # DB client singleton
        ├── auth.ts            # NextAuth config
        ├── format.ts          # Currency/mileage formatting
        ├── finance.ts         # Loan payment calculator
        ├── email.ts           # SMTP notifications
        ├── dealer.ts          # Dealer-info constants
        ├── require-admin.ts   # Server-side auth guard
        └── syndication/       # Feed generators + SFTP + runner
            ├── autotrader.ts
            ├── cargurus.ts
            ├── generic.ts
            ├── sftp.ts
            └── runner.ts
```

---

## Production deployment

### Database
Use PostgreSQL for production:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dreamdrive"
```

For AWS databases that require IAM-only authentication, do not set a static
`DATABASE_URL`. Configure these values instead:

```env
DATABASE_AUTH_MODE="iam"
RDS_HOST="your-cluster-endpoint"
RDS_PORT="5432"
RDS_DATABASE="postgres"
RDS_USER="dreamdriveadmin"
RDS_REGION="us-east-2"
```

Run `npm run db:migrate` after the production database environment variables
are configured. Run `npm run db:admin` once with `ADMIN_EMAIL` and
`ADMIN_PASSWORD` set to create the first admin user without loading sample
inventory.

### Image storage
The upload route writes to S3 when `UPLOADS_S3_BUCKET` is set. Configure:

```env
UPLOADS_S3_BUCKET="your-bucket"
UPLOADS_S3_REGION="us-east-1"
UPLOADS_S3_PREFIX="uploads"
UPLOADS_PUBLIC_BASE_URL="https://your-public-bucket-or-cloudfront-domain"
```

Local development still falls back to `public/uploads` when S3 is not configured.

### Hosting
- **Web**: AWS Amplify Hosting, Vercel, Fly.io, Render, Railway, or any Node host.
- **Worker**: Same infra; long-running process. Or run as a separate service with a 
  dedicated container, supervised by PM2/systemd.

For Amplify Hosting, `amplify.yml` copies the required server-side environment
variables into `.env.production`, runs `npm run db:migrate` when `DATABASE_URL`
is set, and then runs the Next.js production build.

### Email
Set `SMTP_*` vars to a transactional provider (Postmark, SendGrid, Resend, SES).

### Auth
- Set a strong `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`).
- Set `NEXTAUTH_URL` to your public URL.

---

## Customization

- **Dealer info and public copy**: update `/admin/settings`; environment variables remain fallback defaults for first boot and feeds.
- **Brand colors / fonts**: `tailwind.config.ts` and `src/app/globals.css`.
- **Feed columns** (when partners send custom specs): `src/lib/syndication/{autotrader,cargurus,generic}.ts`.
- **Lead routing**: `src/app/api/leads/route.ts` (add CRM webhook, Slack, etc.).

---

## Default credentials

After running `npm run db:seed`:

- Admin: `admin@dreamdriveauto.com` / `changeme`

**Change this immediately in production.**
