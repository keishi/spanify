# Build Failure Analysis: 2025_03_19_patch_611

## First error

../../third_party/blink/renderer/core/html/parser/html_document_parser_fastpath.cc:462:33: error: no viable conversion from 'pointer' (aka 'const unsigned char *') to 'base::span<const unsigned char>'
  462 |   base::span<const Char> pos_ = source_.data();
      |                                 ^~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code initializes a `base::span<const Char> pos_` with the `.data()` method of a `StringRef`. The underlying type of `Char` is `unsigned char` or `char16_t`, so the code is trying to initialize `base::span<const unsigned char>` or `base::span<const char16_t>` with a raw pointer obtained from `StringRef`. This requires implicit conversion from `pointer` (aka `const unsigned char *` or `const char16_t *`) to `base::span<const unsigned char>` or `base::span<const char16_t>`. But the span's constructor requires CompatibleRange which is not satisfied by raw pointer.

## Solution
The rewriter needs to recognize this pattern and generate the correct code. The rewriter could create a span from the underlying `StringRef` and its size. Or it could create a temporary `std::string_view` and create a span from that.

```diff
-  base::span<const Char> pos_ = source_.data();
+  base::span<const Char> pos_ = base::span(source_.data(), source_.length());
```

Or

```diff
-  base::span<const Char> pos_ = source_.data();
+  base::span<const Char> pos_ = std::string_view(source_.data(), source_.length());
```

## Note
There are other errors related to `ParseChildren`. These are a result of the first error.