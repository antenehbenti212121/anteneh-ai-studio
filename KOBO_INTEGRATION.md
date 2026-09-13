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

## Safety gates

No statistical analysis is enabled until the existing dataset validation and quality gate passes. No values, observations, citations, or statistical findings may be fabricated.

Existing CSV import remains supported independently of KoboToolbox.
