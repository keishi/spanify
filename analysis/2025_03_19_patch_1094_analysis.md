# Build Failure Analysis: 2025_03_19_patch_1094

## First error

../../chrome/services/file_util/public/cpp/sandboxed_zip_analyzer_unittest.cc:172:46: error: invalid operands to binary expression ('const base::span<const uint8_t>' (aka 'const span<const unsigned char>') and 'const size_t' (aka 'const unsigned long'))
  172 |                           data.sha256_digest + crypto::kSHA256Length),

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code attempts to compute an end pointer by adding `crypto::kSHA256Length` to a `base::span`. The correct way to do that would be `data.sha256_digest.data() + crypto::kSHA256Length` but the rewriter failed to add `.data()` to a variable it did spanify.

## Solution
The rewriter should recognize this pattern and add `.data()` to access the raw pointer from the span.

## Note
The secondary error is 
```
../../chrome/services/file_util/public/cpp/sandboxed_zip_analyzer_unittest.cc:56:31: error: [chromium-rawptr] Use raw_span<T> instead of a span<T>.
   56 |     base::span<const uint8_t> sha256_digest;
      |                               ^
```
But it is not the cause of the compile error.