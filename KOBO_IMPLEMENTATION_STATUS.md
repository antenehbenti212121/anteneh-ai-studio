# KoboToolbox integration status — ANTENEH RESEARCH HUB

## Current status

The Research Hub has a documented production contract for KoboToolbox integration. The remaining implementation is the secure server-side adapter that retrieves project submissions and normalizes them into the existing Research Hub dataset shape.

## Required implementation

1. Accept only a Kobo project asset UID from the browser.
2. Read `KOBO_SERVER_URL` and `KOBO_API_TOKEN` from server-side environment variables.
3. Request `/api/v2/assets/{asset_uid}/data/` with the `Authorization: Token ...` header.
4. Follow the response `next` URL until it is null so all pages are retrieved.
5. Normalize records into `name`, `rows`, `columns`, `headers`, `data`, `dataDictionary`, `quality`, and `importedAt`.
6. Preserve provenance: source, asset UID, fetched timestamp, and record count.
7. Run the existing dataset validation and quality gate before statistical analysis is enabled.
8. Return a clear configuration error when server credentials are absent; never ask the browser to provide or store the API token.
9. Keep the existing CSV import path working independently.

## Security boundary

The Kobo API token is a credential with access to account data. It must never be embedded in client JavaScript, localStorage, exported project backups, URLs, or browser-visible configuration.

## API version

Use KoboToolbox KPI v2 only. Legacy v1 endpoints must not be implemented.

## Fallbacks

Synchronous Kobo exports can remain a controlled bridge for deployments where the authenticated adapter is not configured. REST Services can be considered later for push-based ingestion of newly created records.

## Scientific boundary

Kobo ingestion must never fabricate observations, citations, statistical values, or study findings. Analysis remains gated by validated data and an approved analysis plan.
