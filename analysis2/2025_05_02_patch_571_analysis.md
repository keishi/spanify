# Build Failure Analysis: 2025_05_02_patch_571

## First error

Overlapping replacements: ./chrome/browser/image_decoder/image_decoder_browsertest.cc at offset 3016, length 22: ").subspan( sizeof(kJpgData) - 1)" and offset 3018, length 16: "(kJpgData.size() * sizeof(decltype(kJpgData)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements to the same region of code. The first replacement is from RewriteArraySizeof, which is rewriting `sizeof(kJpgData)` to `(kJpgData.size() * sizeof(decltype(kJpgData)::value_type))`. The second overlapping replacement is from AppendDataCall adding `.data()` to the string view variable. The root cause is that `kJpgData` was converted to a `string_view` and the rewriter tried to rewrite `sizeof(kJpgData)` and then add `.data()` at the end, but the generated replacement regions overlapped.

## Solution
The rewriter should avoid applying overlapping replacements. More specifically, the rewriter should avoid rewriting `sizeof` when the underlying variable has been changed to string_view.

## Note