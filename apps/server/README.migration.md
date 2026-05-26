# CSV to MongoDB Migration Guide

## What this does
- Analyzes all CSVs in `database/`
- Detects nullable/numeric/date-like fields
- Imports to MongoDB collections: `products`, `orders`, `orderItems`, `refunds`, `sessions`, `pageviews`
- Uses idempotent upserts to prevent duplicate imports
- Writes logs and JSON reports to `apps/server/logs/`

## Expected relationships
- `orders.order_id -> orderItems.orderLegacyId`
- `orderItems.productLegacyId -> products.legacyProductId`
- `refunds.orderItemLegacyId -> orderItems.legacyOrderItemId`
- `sessions.legacySessionId -> pageviews.sessionLegacyId`

## Setup
1. Copy `.env.example` to `.env`
2. Set `MONGO_URI` (or reuse `MONGODB_URL`)
3. Install dependencies

## Commands
- Analyze only:
  - `npm run -w apps/server migrate:analyze`
- Import products:
  - `npm run -w apps/server migrate:products`
- Import orders + items + refunds:
  - `npm run -w apps/server migrate:orders`
- Import sessions + pageviews:
  - `npm run -w apps/server migrate:sessions`
- Import all:
  - `npm run -w apps/server migrate:all`
- Verify records + integrity:
  - `npm run -w apps/server migrate:verify`
- DB health check:
  - `npm run -w apps/server migrate:health`
- Reset migration collections:
  - `npm run -w apps/server migrate:reset`

## Rerun safety
Imports use `bulkWrite` + `upsert` on stable legacy IDs, so reruns update existing docs instead of duplicating them.

## Logs and reports
- `logs/migration.log`
- `logs/errors.log`
- `logs/report-analysis.json`
- `logs/report-products.json`
- `logs/report-orders-domain.json`
- `logs/report-sessions-domain.json`
- `logs/report-verification.json`
- `logs/final-report.json`
