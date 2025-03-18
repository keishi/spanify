# Build Failure Analysis: 2025_03_14_patch_1619

## First error

../../chrome/services/file_util/public/cpp/sandboxed_rar_analyzer_unittest.cc:99:46: error: invalid operands to binary expression ('const base::span<const uint8_t>' (aka 'const span<const unsigned char>') and 'const size_t' (aka 'const unsigned long'))

## Category
Rewriter needs to handle `data.sha256_digest + crypto::kSHA256Length` where the `span` type is on the left hand side.

## Reason
The expression `data.sha256_digest + crypto::kSHA256Length` is trying to add a `span` and an integer. The code rewrite needs to use `data.sha256_digest.data()` to get the underlying pointer type before performing pointer arithmetic.

## Solution
Change the expression from `data.sha256_digest + crypto::kSHA256Length` to `data.sha256_digest.data() + crypto::kSHA256Length`. The fix can be applied to the line that is failing.

```cpp
EXPECT_EQ(std::string(data.sha256_digest.data(),
                          data.sha256_digest + crypto::kSHA256Length),
```

should be

```cpp
EXPECT_EQ(std::string(data.sha256_digest.data(),
                          data.sha256_digest.data() + crypto::kSHA256Length),
```

## Note
The following errors were also found in the log:
*   Rewriter needs to handle `const uint8_t[]` (aka `const unsigned char[]`) to `base::span<const uint8_t>`

```
../../chrome/services/file_util/public/cpp/sandboxed_rar_analyzer_unittest.cc:146:42: error: no viable conversion from 'const uint8_t[]' (aka 'const unsigned char[]') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  146 |         "not_a_rar.rar", CDRDT(ARCHIVE), kNotARarSignature, false, false, 18,
      |                                          ^~~~~~~~~~~~~~~~~
```

*   Rewriter needs to handle `const uint8_t[]` (aka `const unsigned char[]`) to `base::span<const uint8_t>`

```
../../chrome/services/file_util/public/cpp/sandboxed_rar_analyzer_unittest.cc:153:9: error: no viable conversion from 'const uint8_t[]' (aka 'const unsigned char[]') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  153 |         kSignedExeSignature,
      |         ^~~~~~~~~~~~~~~~~~~
```

*   Rewriter needs to avoid spanifying member field to base::span in struct declaration.

```
../../chrome/services/file_util/public/cpp/sandboxed_rar_analyzer_unittest.cc:52:31: error: [chromium-rawptr] Use raw_span<T> instead of a span<T>.
   52 |     base::span<const uint8_t> sha256_digest;
      |                               ^