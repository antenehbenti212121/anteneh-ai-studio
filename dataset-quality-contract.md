# Research Hub Dataset Quality Contract

The Research Hub accepts datasets from CSV and KoboToolbox through the same logical quality gates before statistical execution.

Required checks:
- non-empty column names
- unique column names (case-insensitive)
- at least one data record
- consistent row width
- missingness summary for every variable
- numeric/categorical role inference as a planning aid only
- large-dataset warning when browser memory may become a constraint
- source provenance retained with the dataset
- statistical execution remains blocked until an approved analysis plan exists

This contract does not manufacture values, infer causal conclusions, or replace investigator review.

KoboToolbox ingestion uses KPI v2 and retains the asset UID, fetch timestamp, record count, and page count in provenance.
