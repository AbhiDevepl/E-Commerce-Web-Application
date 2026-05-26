# Requirements Document

## Introduction

This document specifies the requirements for completing the CSV-to-MongoDB migration system in `apps/server` of the E-Commerce-Web-Application Turborepo. The system already has a working skeleton (models, utilities, import scripts, config). The remaining work closes six specific gaps: full Zod validation coverage, scalable orphan-detection in verification, enriched health-check reporting, dry-run enforcement across all import scripts, guaranteed log-directory creation, and a corrected import-orchestration order that processes sessions before orders.

## Glossary

- **Validator**: The module at `apps/server/src/utils/validation.ts` that exports Zod schemas for each CSV row type.
- **ImportScript**: Any of `importProducts.ts`, `importOrders.ts`, `importSessions.ts`, or `importAll.ts` in `apps/server/src/scripts/`.
- **Orchestrator**: `importAll.ts` — the script that runs the full migration sequence.
- **Verifier**: `verifyImport.ts` — the script that counts documents and checks referential integrity.
- **HealthChecker**: `healthCheck.ts` — the script that reports database status.
- **DryRun**: An execution mode controlled by `migrationEnv.dryRun` (`MIGRATION_DRY_RUN=true`) in which no writes are committed to MongoDB.
- **BulkWrite**: A MongoDB `bulkWrite` operation with `upsert: true` keyed on the legacy ID field.
- **BatchSize**: The number of documents accumulated before a BulkWrite is issued, configurable via `MIGRATION_BATCH_SIZE` (default 1000).
- **LogsDir**: The directory path resolved from `migrationEnv.logsDir` (default `apps/server/logs/`).
- **LegacyId**: The original integer primary key from the CSV source (e.g. `product_id`, `order_id`).
- **OrphanDocument**: A document whose foreign-key LegacyId references a LegacyId that does not exist in the parent collection.
- **AggregationPipeline**: A MongoDB `$lookup`-based aggregation used to detect OrphanDocuments without loading full ID sets into memory.
- **MigrationProduct**: Mongoose model for the `products` collection.
- **MigrationOrder**: Mongoose model for the `orders` collection.
- **MigrationOrderItem**: Mongoose model for the `orderItems` collection.
- **MigrationRefund**: Mongoose model for the `refunds` collection.
- **MigrationSession**: Mongoose model for the `sessions` collection.
- **MigrationPageview**: Mongoose model for the `pageviews` collection.

---

## Requirements

### Requirement 1: Full Zod Validation Coverage

**User Story:** As a migration engineer, I want every CSV field validated by the Validator before a row is written to MongoDB, so that corrupt or missing data is caught at parse time and never silently stored.

#### Acceptance Criteria

1. THE Validator SHALL export a `productRowSchema` that validates `product_id` as a required positive integer (coerced from string), `created_at` as a required non-empty string, and `product_name` as a required non-empty string.
2. THE Validator SHALL export an `orderRowSchema` that validates `order_id`, `website_session_id`, `user_id`, and `primary_product_id` as required positive integers (coerced from string), `created_at` as a required non-empty string, `items_purchased` as a required positive integer (coerced from string), and `price_usd` and `cogs_usd` as required non-negative numbers (coerced from string).
3. THE Validator SHALL export an `orderItemRowSchema` that validates `order_item_id`, `order_id`, and `product_id` as required positive integers (coerced from string), `created_at` as a required non-empty string, `is_primary_item` as a required field that accepts only the string values `"0"` or `"1"` (any other value causes validation failure), and `price_usd` and `cogs_usd` as required non-negative numbers (coerced from string).
4. THE Validator SHALL export a `refundRowSchema` that validates `order_item_refund_id`, `order_item_id`, and `order_id` as required positive integers (coerced from string), `created_at` as a required non-empty string, and `refund_amount_usd` as a required non-negative number (coerced from string).
5. THE Validator SHALL export a `sessionRowSchema` that validates `website_session_id` and `user_id` as required positive integers (coerced from string), `created_at` as a required non-empty string, `is_repeat_session` as a required field that accepts only the string values `"0"` or `"1"` (any other value causes validation failure), and `utm_source`, `utm_campaign`, `utm_content`, `device_type`, and `http_referer` as optional fields that may be absent, empty, or null.
6. THE Validator SHALL export a `pageviewRowSchema` that validates `website_pageview_id` and `website_session_id` as required positive integers (coerced from string), `created_at` as a required non-empty string, and `pageview_url` as a required non-empty string.
7. WHEN a CSV row fails schema validation, THE calling ImportScript SHALL log a warning via `migrationLogger.warn` that includes the row number and the validation error details, increment the `invalid` counter for that import, and continue processing the next row without halting the stream.
8. WHEN a CSV row passes schema validation, THE Validator SHALL return an object where each field is present at runtime and its runtime type matches the schema's declared output type (e.g. `product_id` is a `number`, `created_at` is a `string`, optional string fields are `string | undefined`).

---

### Requirement 2: Scalable Orphan Detection in Verification

**User Story:** As a migration engineer, I want the Verifier to detect OrphanDocuments without loading millions of IDs into Node.js memory, so that verification succeeds on the full 1.18M-pageview dataset without running out of memory or timing out.

#### Acceptance Criteria

1. THE Verifier SHALL detect orphan MigrationOrderItems using a server-side operation that does not load the full set of `legacyOrderId` values into Node.js memory; the resulting count SHALL equal the number of MigrationOrderItem documents whose `orderLegacyId` has no matching `legacyOrderId` in the MigrationOrder collection.
2. THE Verifier SHALL detect orphan MigrationRefunds using a server-side operation that does not load the full set of `legacyOrderItemId` values into Node.js memory; the resulting count SHALL equal the number of MigrationRefund documents whose `orderItemLegacyId` has no matching `legacyOrderItemId` in the MigrationOrderItem collection.
3. THE Verifier SHALL detect orphan MigrationPageviews using a server-side operation that does not load the full set of `legacySessionId` values into Node.js memory; the resulting count SHALL equal the number of MigrationPageview documents whose `sessionLegacyId` has no matching `legacySessionId` in the MigrationSession collection.
4. THE Verifier SHALL return an `integrity` object containing `orphanOrderItems`, `orphanRefunds`, and `orphanPageviews` as non-negative integer counts.
5. IF all three orphan counts are zero, THEN THE Verifier SHALL log a success message via `migrationLogger.info` confirming referential integrity.
6. IF any orphan count is greater than zero, THEN THE Verifier SHALL emit one `migrationLogger.warn` call per affected collection that includes the collection name and the orphan count.
7. THE Verifier SHALL complete all three orphan checks within 120 seconds when run against a dataset of up to 1.18M pageview documents on a standard development machine.

---

### Requirement 3: Enriched Health-Check Reporting

**User Story:** As a migration engineer, I want the HealthChecker to report index status, per-collection document counts, storage sizes, and memory usage, so that I can diagnose performance issues and confirm the database is ready before running a migration.

#### Acceptance Criteria

1. THE HealthChecker SHALL report the MongoDB connection state (as a numeric readyState), database name, and host in its output.
2. THE HealthChecker SHALL list all collections present in the connected database at the time of the check.
3. WHEN listing collections, THE HealthChecker SHALL include for each collection: the collection name, document count (as a non-negative integer), and storage size in bytes (as a non-negative integer), obtained via the `collStats` command or `$collStats` aggregation stage.
4. THE HealthChecker SHALL report the MongoDB server's resident memory usage in megabytes (as a non-negative number) obtained via the `serverStatus` command.
5. THE HealthChecker SHALL report, for each of the six migration collections, the list of index names and their key patterns as defined on the collection.
6. WHEN the HealthChecker cannot retrieve stats for a specific collection, THE HealthChecker SHALL log a warning via `migrationLogger.warn` that includes the collection name and the error reason, and SHALL continue reporting stats for the remaining collections.
7. THE HealthChecker SHALL write its complete status report as a single JSON object to stdout before exiting.

---

### Requirement 4: Dry-Run Mode Enforcement

**User Story:** As a migration engineer, I want every ImportScript to respect the `dryRun` flag so that I can validate the full pipeline — parsing, validation, batching, and logging — against the real CSV files without writing a single document to MongoDB.

#### Acceptance Criteria

1. WHEN `migrationEnv.dryRun` is `true`, THE ImportScript SHALL skip all BulkWrite operations and log a dry-run notice via `migrationLogger.info` for each batch that would have been written; the notice SHALL include the collection name and the batch size.
2. WHEN `migrationEnv.dryRun` is `true`, THE ImportScript SHALL still stream and validate every CSV row, accumulate batches, and maintain the `processed`, `invalid`, and `duplicatesInCsv` counters with identical values to a live run.
3. WHEN `migrationEnv.dryRun` is `true`, THE ImportScript SHALL return a summary object containing `processed`, `invalid`, `duplicatesInCsv`, `insertedOrUpdated` (set to `0`), and `dryRun: true`.
4. WHEN `migrationEnv.dryRun` is `false`, THE ImportScript SHALL execute BulkWrite operations normally with no change to existing behavior, and the summary object SHALL NOT include a `dryRun` field.
5. WHEN `migrationEnv.dryRun` is `true` and the Orchestrator runs, THE Orchestrator SHALL include `dryRun: true` as a top-level field in the final report object written by `migrationLogger.report`.

---

### Requirement 5: Guaranteed Logs Directory Creation

**User Story:** As a migration engineer, I want the migration system to create the logs directory automatically if it does not exist, so that scripts never fail with a file-not-found error on a fresh checkout or clean environment.

#### Acceptance Criteria

1. WHEN any ImportScript, Verifier, or HealthChecker initialises, THE system SHALL ensure the LogsDir exists before the first log write is attempted, using an operation equivalent to `fs.mkdir(logsDir, { recursive: true })`.
2. IF the LogsDir already exists at initialisation time, THEN THE system SHALL proceed without error and without modifying the existing directory or its contents.
3. WHEN the Orchestrator starts, THE Orchestrator SHALL ensure the LogsDir exists before invoking any ImportScript, Verifier, or HealthChecker.
4. IF the LogsDir cannot be created due to a filesystem permission error, THEN THE system SHALL throw an error whose message identifies the target path and states the reason for failure, and SHALL abort the initialisation of the calling script.

---

### Requirement 6: Corrected Import Orchestration Order

**User Story:** As a migration engineer, I want the Orchestrator to import sessions and pageviews before orders and order items, so that foreign-key references from orders to `website_session_id` are resolvable at verification time and the final report reflects the correct dependency order.

#### Acceptance Criteria

1. THE Orchestrator SHALL execute import phases in the following order: (0) `connectMigrationDb`, (1) `analyzeCsvs`, (2) `importProducts`, (3) `importSessionsAndPageviews`, (4) `importOrdersAndChildren`, (5) `verifyImport`.
2. WHEN any phase throws an error, THE Orchestrator SHALL pass both a descriptive message and the error object to `migrationLogger.error`, set `process.exitCode = 1`, and proceed to `disconnectMigrationDb` in the `finally` block without executing any subsequent phases.
3. THE Orchestrator SHALL write the final report via `migrationLogger.report` only after all five import/verify phases complete successfully; the report object SHALL contain the top-level fields `products`, `sessionDomain`, `orderDomain`, `verification`, `dryRun` (when applicable), `durationMs` (measured from before `connectMigrationDb`), and `finishedAt` (ISO 8601 string).
4. THE Orchestrator SHALL be runnable as a standalone script via the `if (import.meta.url === \`file://\${process.argv[1]}\`)` ESM guard.
