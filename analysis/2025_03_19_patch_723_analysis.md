# Build Failure Analysis: 2025_03_19_patch_723

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5368, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5374, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type)` and append `.data()` to `buffer`. This results in overlapping replacements since the `.data()` call is being appended inside the `sizeof` expression.

## Solution
The rewriter should avoid generating overlapping replacements, likely by ensuring that RewriteArraySizeof and AppendDataCall do not operate on the same expressions.

## Note