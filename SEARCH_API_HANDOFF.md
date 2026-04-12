# Dharma Library Search API — Frontend Integration Handoff

The semantic search service is live and fully operational. This document covers everything
needed to integrate it into the static frontend.

---

## What was built

A cloud-hosted semantic search service backed by:

- **Amazon API Gateway HTTP API** — receives search requests from the browser
- **AWS Lambda (Python)** — embeds the query using Amazon Bedrock Titan and queries the vector index
- **Amazon S3 Vectors** — stores 461,106 pre-embedded passage chunks from the talk corpus
- **Amazon Bedrock Titan Text Embeddings V2** — converts search queries into 512-dimensional vectors at query time

When a user submits a search query, Lambda calls Bedrock to embed the query text, then calls
S3 Vectors to find the nearest matching passages. Results are ranked by cosine similarity and
returned as JSON.

---

## API reference

### Endpoint

```
POST https://05yjv01mbk.execute-api.us-east-1.amazonaws.com/search
```

### Headers

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-Api-Key` | `dharma-library-link` |

### Request body

```json
{
  "query": "the nature of suffering",
  "top_k": 5
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | yes | Natural-language search query, 3–150 characters |
| `top_k` | integer | no | Number of results to return (default: 5, max: 20) |

### Response

```json
{
  "results": [
    {
      "talk_id": "2019-03-15-ajahn-chah-on-mind",
      "chunk_index": 3,
      "chunk_text": "The mind that is still is like still water...",
      "similarity": 0.91
    },
    ...
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `talk_id` | string | Filename of the source talk (without `.txt` extension) |
| `chunk_index` | integer | Zero-based paragraph index within the talk |
| `chunk_text` | string | The passage text matching the query |
| `similarity` | float | Cosine similarity score, 0–1. Higher is more relevant. |

### Error responses

| Status | Body | Meaning |
|---|---|---|
| `400` | `{"error": "query must be at least 3 characters"}` | Query too short |
| `400` | `{"error": "query must be 150 characters or fewer"}` | Query too long |
| `401` | `{"error": "Unauthorized"}` | Missing or wrong `X-Api-Key` header |
| `429` | *(no body)* | Rate limit hit — slow down requests |
| `503` | `{"error": "Embedding service unavailable"}` | Bedrock unreachable |
| `503` | `{"error": "Search index unavailable"}` | S3 Vectors unreachable |

---

## Frontend JavaScript example

```javascript
async function search(query, topK = 5) {
  const response = await fetch(
    "https://05yjv01mbk.execute-api.us-east-1.amazonaws.com/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "dharma-library-link",
      },
      body: JSON.stringify({ query, top_k: topK }),
    }
  );

  if (response.status === 429) {
    throw new Error("Too many requests — please wait a moment and try again.");
  }
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error(error || `Search failed (${response.status})`);
  }

  const { results } = await response.json();
  return results;
}
```

Each result object has `talk_id`, `chunk_index`, `chunk_text`, and `similarity`.
`talk_id` can be used to construct a link to the full talk on the static site.

---

## CORS

The API is configured to allow requests only from the static site's origin. No additional
CORS setup is needed in the frontend — the browser will handle the preflight automatically.
If the static site moves to a new domain, the `StaticSiteOrigin` CloudFormation parameter
must be updated and the stack redeployed.

---

## Rate limits

The service enforces the following limits:

- **2 requests/second** sustained (API Gateway)
- **Burst of 10** requests (API Gateway)
- **2 concurrent executions** maximum (Lambda reserved concurrency)

For a search-as-you-type implementation, debounce user input to avoid hitting the rate limit.
A 300–500ms debounce after the last keystroke is recommended.

---

## Typical query latency

- **Warm Lambda**: ~300–500ms end-to-end (Bedrock embed + S3 Vectors query)
- **Cold start**: under 1 second (keep-warm is enabled, so cold starts are rare during active periods)

---

## Notes for implementation

- The `talk_id` field matches the source `.txt` filename without the extension. Use this to
  build links to individual talks on the static site.
- `chunk_index` is zero-based. If you want to display context around a result, adjacent
  chunks from the same `talk_id` will have `chunk_index ± 1`.
- Results are already ranked — index 0 is the most relevant. No client-side sorting needed.
- The API key is intentionally embedded in the frontend bundle. It is not a secret — it
  exists to prevent automated scanner traffic, not to authenticate users.
