# Build Failure Analysis: 2025_05_02_patch_570

## First error

Overlapping replacements: ./chrome/browser/image_decoder/image_decoder_browsertest.cc at offset 1458, length 22: ").subspan( sizeof(kPngData) - 1)" and offset 1460, length 16: "(kPngData.size() * sizeof(decltype(kPngData)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first tried to rewrite `sizeof(kPngData) - 1` to `(kPngData.size() * sizeof(decltype(kPngData)::value_type)) - 1`, and then tried to add `.data()` to `kPngData`, resulting in overlapping replacements.

## Solution
The rewriter needs to avoid generating overlapping replacements. Consider rewriting `sizeof` first before adding `.data()`.

## Note
N/A