# Build Failure Analysis: 2025_05_02_patch_1446

## First error

../../components/language_detection/core/ngram_hash.cc:217:5: error: no matching function for call to 'GetNGramHashIndices'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GetNGramHashIndices` was spanified, but the call site `GetNGramHashIndices(params, output->data.i32)` is passing a raw pointer `output->data.i32`. The compiler can't convert a raw `int32_t*` to a `base::span<int32_t>`. The rewriter failed to update the call site to pass a span.

## Solution
The rewriter needs to identify call sites to spanified functions and update them to pass spans when appropriate. In this case, the call site should be updated to `GetNGramHashIndices(params, base::span<int32_t>(output->data.i32, params->GetNumTokens()));`

## Note