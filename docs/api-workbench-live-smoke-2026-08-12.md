# API Workbench live smoke — 2026-08-12

This report records real provider calls made with operator-entered, process-memory-only credentials. It contains no API key, prompt output, media bytes, or local absolute path.

## Method

- One text-only Chat Completions request per channel.
- No automatic retry.
- MiniMax H3 target, 5-second fictional desk-lamp product-proof intent.
- The OpenAI-compatible channel first queried the provider's `/v1/models` endpoint and selected the returned `gemini-3.5-flash` ID; the model was not guessed.
- Credentials were entered with hidden PowerShell input, inherited only by child processes, and cleared when the harness completed.

## Provider results

| Channel | Endpoint host | Server-confirmed model | Provider result | Attempts | Total tokens | Duration | Output SHA-256 |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 贞贞的平价小屋 | `api.seedance.nz` | `bytedance/doubao-seed-evolving` | Complete non-empty output and receipt returned | 1 | 1,285 | 26,971 ms | `567d9dc50eea7e59c0d01eb4cb61d9c5b4d753d704bfbef09cbd704bdb4d9842` |
| 贞贞的 AI 工坊 | `ai.t8star.org` | `gemini-3.5-flash` | Complete non-empty output and receipt returned | 1 | 1,639 | 10,737 ms | `dd7a2448b8353963dc3c89d988da919ed5aaa31e703a48c9c7b9f8b0ad02f06c` |
| OpenAI 兼容 | `ai.t8star.cn` | `gemini-3.5-flash` | Complete non-empty output and receipt returned | 1 | 1,948 | 10,605 ms | `4f3c82993c4f7bae50fc1d55218f73311804d7f5df1618c0aa39ed8499bd60ef` |

All three responses included request identifiers and usage objects. The exact identifiers remain in the operator's ephemeral smoke result and are intentionally omitted here.

## Validation finding and repair

The first live run exposed a local validator defect: the sentence-initial instruction word `Create` was classified as an explicit user fact and therefore generated a false `user_fact_missing` error for all three otherwise successful provider responses.

The fact extractor was repaired so that ordinary sentence-initial commands and ordinary hyphenated adjectives are not treated as protected facts, while quoted text, standalone numbers, acronyms, mixed-case identifiers, and structured IDs remain protected. Dedicated regression tests now cover the live-smoke intent.

The retained validation traces show:

- AI 工坊: all three deterministic mechanism anchors located;
- OpenAI 兼容: all three deterministic mechanism anchors located;
- 平价小屋: two of three anchors located; the remaining anchor was rendered with wording the deterministic matcher could not certify, so it remains a warning rather than an invented pass.

No second paid batch was issued merely to re-run a corrected local validator.
