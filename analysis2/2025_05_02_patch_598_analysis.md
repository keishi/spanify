# Build Failure Analysis: 2025_05_02_patch_598

## First error

../../third_party/blink/renderer/core/html/parser/html_document_parser_fastpath.cc:462:33: error: no viable conversion from 'pointer' (aka 'const unsigned char *') to 'base::span<const unsigned char>'

## Category
Rewriter failed to handle raw pointer passed to spanified function.

## Reason
The rewriter changed the type of `pos_` from `const Char*` to `base::span<const Char>`, where `Char` is a template parameter that can be either `unsigned char` or `char16_t`. However, the initialization `base::span<const Char> pos_ = source_.data();` is failing because there is no implicit conversion from a raw pointer (e.g., `const unsigned char*`) to a `base::span`. The rewriter should have created a span from the data and size.

## Solution
The rewriter needs to use the `base::span` constructor that takes a pointer and a size. The corrected code would be `base::span<const Char> pos_ = base::span<const Char>(source_.data(), source_.size());`.

## Note
The error occurs when instantiating the `HTMLFastPathParser` class with `Char = unsigned char` and `Char = char16_t`, indicating that the template needs to be handled properly. There are also other compilation errors due to ParseChildren.