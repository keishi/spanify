# Build Failure Analysis: 2025_05_02_patch_247

## First error

../../components/language_detection/core/embedding_lookup.cc:201:3: error: no matching function for call to 'GetEmbedding'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GetEmbedding` was spanified to take `base::span<float>` as an argument. However, the call site `GetEmbedding(input, embedding_table, ... , data, ...)` is passing a raw pointer `float* data`. The rewriter failed to spanify the call site to construct a `base::span` from the raw pointer.

## Solution
The rewriter should identify all call sites to spanified functions and ensure that arguments are converted to the expected span type. In this case, the call site should be modified to construct a `base::span` from the `data` pointer along with a known size, or determine the correct size dynamically. The rewriter should have converted the call site to `GetEmbedding(input, embedding_table, ... , base::span<float>(data, size), ...)` where size is determined from other variables or constants used in the code.

## Note