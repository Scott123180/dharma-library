# Contract: Semantic Search API

**Feature**: `specs/001-search-talks`
**Date**: 2026-04-12
**Source**: `SEARCH_API_HANDOFF.md`

This contract documents the external search service the frontend calls. The service is
already live; the frontend must conform to this contract exactly.

---

## Endpoint

```
POST https://05yjv01mbk.execute-api.us-east-1.amazonaws.com/search
```

---

## Request

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `X-Api-Key` | `dharma-library-link` | Yes |

### Body

```json
{
  "query": "the nature of impermanence",
  "top_k": 10
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `query` | string | Yes | 3–150 characters |
| `top_k` | integer | No | Default: 5, max: 20. Frontend always sends 10. |

---

## Response

### Success (200)

```json
{
  "results": [
    {
      "talk_id": "2019-03-15-ajahn-chah-on-mind",
      "chunk_index": 3,
      "chunk_text": "The mind that is still is like still water...",
      "similarity": 0.91
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `results` | array | Ordered by similarity descending; index 0 = most relevant. |
| `talk_id` | string | Filename of the source talk without `.txt`. Matches `TalkMetadata.id`. |
| `chunk_index` | integer | Zero-based paragraph index within the talk. |
| `chunk_text` | string | The matching passage. |
| `similarity` | float | Cosine similarity 0–1. |

### Error Responses

| Status | Body | Frontend handling |
|--------|------|-------------------|
| `400` | `{"error": "query must be at least 3 characters"}` | Should not reach API (frontend validates ≥ 3 chars) |
| `400` | `{"error": "query must be 150 characters or fewer"}` | Should not reach API (input capped at 150) |
| `401` | `{"error": "Unauthorized"}` | Show generic error state; log to console |
| `429` | *(no body)* | Show rate-limit message: "Too many requests — please wait a moment." |
| `503` | `{"error": "Embedding service unavailable"}` or `{"error": "Search index unavailable"}` | Show service error state with retry button |

---

## Rate Limits

| Limit | Value |
|-------|-------|
| Sustained | 2 requests/second |
| Burst | 10 requests |
| Concurrent Lambda executions | 2 |

The frontend submits on explicit user action only (no search-as-you-type), so rate limits
should not be hit under normal usage.

---

## Latency

| Scenario | Expected latency |
|----------|-----------------|
| Warm Lambda | 300–500ms end-to-end |
| Cold start (rare) | < 1 second |

---

## CORS

Configured for the static site origin (`dharmalibrary.link`). No additional frontend CORS
configuration required. If the site domain changes, the API Gateway `StaticSiteOrigin`
parameter must be updated.

---

## Notes

- The API key (`dharma-library-link`) is intentionally public — it exists to block
  automated scanner traffic, not to authenticate users. It is safe to embed in the bundle.
- Results are already ranked server-side; no client-side sorting is required.
- `chunk_index` is zero-based. Adjacent chunks from the same `talk_id` have indices ±1;
  this is available for future "show context" features.
