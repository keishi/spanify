# Build Failure Analysis: 2025_03_19_patch_560

## First error

Overlapping replacements: ./chrome/browser/image_decoder/image_decoder_browsertest.cc at offset 1458, length 22: ").subspan( sizeof(kPngData) - 1)" and offset 1460, length 16: "(kPngData.size() * sizeof(decltype(kPngData)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to both rewrite `sizeof(kPngData) - 1` to use `.size()` and add `.data()` to pass kPngData to the `std::vector` constructor.  The replacements overlap.

## Solution
The rewriter should avoid overlapping replacements. The current code transformation logic appears to not be accounting for the size rewriter or the data() rewriter when calculating the ranges. This most likely involves incorrect ordering of the replacements or incorrect range calculations.

## Note
The diff shows the rewriter correctly converting `char[]` to `std::string_view`.