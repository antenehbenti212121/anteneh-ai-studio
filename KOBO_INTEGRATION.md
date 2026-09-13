# KoboToolbox integration plan

## Production contract

ANTENEH RESEARCH HUB will integrate with KoboToolbox through the current KPI v2 API. Authentication credentials must remain server-side and must never be stored in browser localStorage or shipped in client JavaScript.

## Data flow

KoboToolbox collection → secure server adapter → paginated project data → Research Hub dataset normalization → existing dataset validation/quality gate → approved statistical analysis → results/provenance.

## Required server configuration

- `KOBO_SERVER_URL`
- `KOBO_API_TOKEN`

The UI should request only the Kobo project asset UID. It must never request the API token.

## API behavior

Use the project asset UID with the KPI v2 data endpoint. Follow the API response `next` link until it is null so projects with more than one page of submissions are completely retrieved.

KoboToolbox's current documentation states that KPI v1 endpoints have been removed and that v2 uses the `Authorization: Token ...` header. The submission endpoint is `/api/v2/assets/{asset_uid}/data/`, and paginated responses must be followed through `next`.

## Normalized dataset

The adapter must produce the existing Research Hub shape:

- `name`
- `rows`
- `columns`
- `headers`
- `data`
- `dataDictionary`
- `quality`
- `importedAt`

It must also preserve provenance including source, asset UID, fetched timestamp, and record count.

## Alternative ingestion path

For deployments where authenticated API configuration is not yet available, KoboToolbox synchronous exports may be used as a controlled bridge into the existing CSV ingestion path. This must only be used when the Kobo project is intentionally configured for the required external access. Sensitive/private projects must not be made public merely to enable an integration.

KoboToolbox also supports REST Services that can send newly created records to an external server. This is a possible future push-based adapter, with retry behavior handled by KoboToolbox. It does not replace the KPI v2 pull adapter for full historical synchronization.

## Safety gates

No statistical analysis is enabled until the existing dataset validation and quality gate passes. No values, observations, citations, or statistical findings may be fabricated.

Existing CSV import remains supported independently of KoboToolbox.
