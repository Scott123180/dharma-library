# V2 Migration: Metadata Filtering Support

This document describes the changes required to upgrade the Dharma Library vector search
from v1 (no metadata) to v2 (filterable metadata + non-filterable chunk text).

---

## Background

S3 Vectors supports two metadata tiers declared at **index creation time**:

- **Filterable** (default): usable in `filter` expressions on `query_vectors` calls
- **Non-filterable**: stored and returned with results but cannot be used in filters;
  must be declared explicitly in `metadataConfiguration` when creating the index

Because non-filterable keys are set at index creation and cannot be changed later,
migrating from v1 to v2 requires creating a new index (`talks-v2`).

---

## New File: `build_talk_metadata.py`

A standalone script that transforms a CSV metadata export into `talk_metadata.json`,
which the ingest pipeline consumes. Run this separately whenever the CSV is updated.

### Input

A CSV export with at minimum these columns:
- `Resource ID(s)` — matches the `.txt` filename stem (e.g. `37627` → `37627.txt`)
- `Date` — format `YYYY-MM-DD HH:MM`
- `Speaker` — speaker name; blank or "other" (case-insensitive) → normalized to `"Other"`
- `Koan Case #` — omitted from output if empty
- `Koan Collection` — omitted from output if empty
- `Talk Location` — omitted from output if empty

### Output: `talk_metadata.json`

```json
{
  "37627": {
    "speaker": "Jody Hojin Kimmel",
    "year": 2024,
    "month": 3,
    "location": "Zen Mountain Monastery"
  },
  "12345": {
    "speaker": "Other",
    "year": 2019,
    "month": 6,
    "koan_case": "42",
    "koan_collection": "Blue Cliff Record",
    "location": "Zen Center of New York City"
  }
}
```

### Key behaviors
- `speaker` is **always present** — defaults to `"Other"` when blank or when the raw
  value is "other" (case-insensitive)
- All other fields are omitted when empty rather than stored as null
- Prints a coverage summary on exit: year/month count, Other speaker count, koan count

### Usage
```bash
python build_talk_metadata.py --csv metadata_export.csv
python build_talk_metadata.py --csv metadata_export.csv --out talk_metadata.json
```

---

## Changes to `ingest_s3vectors.py`

### 1. New constant

Add alongside existing constants:

```python
TALK_METADATA_PATH = Path("talk_metadata.json")
```

### 2. New function: `load_talk_metadata`

Add before `load_talks`:

```python
def load_talk_metadata(path: Path) -> dict[str, dict[str, str | int]]:
    """Load talk metadata JSON produced by build_talk_metadata.py."""
    if not path.exists():
        print(f"Warning: {path} not found — vectors will have no metadata beyond talk_id.")
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
```

### 3. `ensure_bucket_and_index` — declare non-filterable keys

Add `metadataConfiguration` to the `create_index` call:

```python
client.create_index(
    vectorBucketName=bucket,
    indexName=index,
    dataType="float32",
    dimension=dim,
    distanceMetric="cosine",
    metadataConfiguration={
        "nonFilterableMetadataKeys": ["chunk_text", "chunk_index"],
    },
)
```

### 4. `build_chunks` — remove `chunk_indices`

`chunk_index` is no longer stored in metadata. Remove it from the return value:

```python
def build_chunks(talks: dict[str, str]) -> tuple[
    list[str], dict[str, str], dict[str, str]
]:
    """Chunk all talks. Returns (chunk_ids, chunk_texts, chunk_talk_ids)."""
    all_chunk_ids: list[str] = []
    chunk_texts: dict[str, str] = {}
    chunk_talk_ids: dict[str, str] = {}

    for talk_id, text in talks.items():
        chunks = chunk_by_paragraphs(text)
        for i, chunk in enumerate(chunks):
            cid = f"{talk_id}__chunk_{i}"
            all_chunk_ids.append(cid)
            chunk_texts[cid] = chunk
            chunk_talk_ids[cid] = talk_id

    return all_chunk_ids, chunk_texts, chunk_talk_ids
```

Update both call sites that previously unpacked 4 values to unpack 3.

### 5. `step_upload` — validate talks_dir and load metadata

Add directory validation before any processing, and load talk metadata:

```python
if not talks_dir.is_dir():
    print(f"Error: talks directory not found: {talks_dir.resolve()}")
    sys.exit(1)
```

After loading talks, guard against an empty result:

```python
if not talks:
    print(f"Error: no talks found in '{talks_dir.resolve()}'. Check the path.")
    sys.exit(1)
```

Load talk metadata early in `step_upload` (before chunking):

```python
print("Loading talk metadata...")
talk_metadata = load_talk_metadata(TALK_METADATA_PATH)
print(f"  {len(talk_metadata)} talks with metadata\n")
```

### 6. `put_batch` — new metadata schema

Replace the metadata dict in the vector payload:

```python
"metadata": {
    "talk_id": chunk_talk_ids[cid],
    **talk_metadata.get(chunk_talk_ids[cid], {}),
    "chunk_text": chunk_texts[cid][:CHUNK_PREVIEW_CHARS],
},
```

The `**talk_metadata.get(...)` unpacks `speaker`, `year`, `month`, `koan_case`,
`koan_collection`, `location` for talks that have them. Talks missing from
`talk_metadata.json` get only `talk_id` and `chunk_text`.

---

## Final Metadata Schema

| Field | Type | Filterable | Notes |
|---|---|---|---|
| `talk_id` | string | yes | Always present |
| `speaker` | string | yes | Always present; "Other" if unknown |
| `year` | number | yes | Omitted if not in metadata JSON |
| `month` | number | yes | Omitted if not in metadata JSON |
| `koan_case` | string | yes | Omitted if not applicable |
| `koan_collection` | string | yes | Omitted if not applicable |
| `location` | string | yes | Omitted if not in metadata JSON |
| `chunk_text` | string | **no** | Returned with results; not filterable |
| `chunk_index` | — | removed | No longer stored |

---

## Lambda Query Handler (`template.yaml`)

The query handler accepts an optional `filter` parameter passed directly to `query_vectors`.
Omitting `filter` is fully backward compatible — existing clients continue to work unchanged.

Request shapes:

Filter by speaker:
```json
{
  "query": "killing a cat",
  "top_k": 5,
  "filter": { "speaker": { "$eq": "John Daido Loori" } }
}
```

Filter by speaker and year range:
```json
{
  "query": "killing a cat",
  "top_k": 5,
  "filter": {
    "$and": [
      { "speaker": { "$eq": "John Daido Loori" } },
      { "year": { "$gt": 1990 } }
    ]
  }
}
```

Filter by year range:
```json
{
  "query": "killing a cat",
  "top_k": 5,
  "filter": { "year": { "$gte": 1980, "$lte": 1985 } }
}
```

Filter to talks with a koan case:
```json
{
  "query": "killing a cat",
  "top_k": 5,
  "filter": { "koan_case": { "$exists": true } }
}
```

Filter by specific koan case:
```json
{
  "query": "killing a cat",
  "top_k": 5,
  "filter": { "koan_case": { "$eq": "14" } }
}
```

S3 Vectors supported operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`,
`$in`, `$nin`, `$exists`, `$and`, `$or`.

The response now includes the full metadata set per result:
```json
{
  "results": [
    {
      "talk_id": "30620",
      "speaker": "John Daido Loori",
      "year": 1982,
      "month": 3,
      "koan_case": "14",
      "koan_collection": "Gateless Gate",
      "location": "Zen Mountain Monastery",
      "chunk_text": "What's the real meaning of this killing of the cat?",
      "similarity": 0.7350
    }
  ]
}
```

---

## Migration Steps

1. ✅ Run `build_talk_metadata.py` to generate `talk_metadata.json`
2. ✅ Run `ingest_s3vectors.py --step upload --index talks-v2 --talks-dir <path>` — 461,106 chunks uploaded
3. ✅ Verified locally with `query_s3vectors.py --index talks-v2` — metadata and filtering confirmed working
4. Deploy the CloudFormation stack with `IndexName=talks-v2`:
   ```bash
   aws cloudformation deploy \
     --template-file template.yaml \
     --stack-name dharma-search \
     --parameter-overrides IndexName=talks-v2 \
     --capabilities CAPABILITY_NAMED_IAM
   ```
5. Delete the old `talks` index once satisfied

No re-embedding is required. Embeddings are reused from the existing cache.
