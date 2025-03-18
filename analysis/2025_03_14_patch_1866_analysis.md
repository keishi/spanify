# Build Failure Analysis: 2025_03_14_patch_1866

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/aac_unittest.cc at offset 5868, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5874, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert `.data()` at the end of the `buffer` variable while also rewriting `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type)`. The replacements overlap because the tool calculates offsets and lengths independently, leading to overlapping modifications.

## Solution
The rewriter needs to ensure that these two rewrites do not overlap. One way to achieve this is to perform one replacement at a time, or to consolidate the changes into a single rewrite step. The rewriter should be smarter about calculating the offsets and lengths of the replacements.

## Note
The build failure log indicates an overlapping replacement error in `media/formats/mp4/aac_unittest.cc`. The error message shows that there's a conflict between the replacement for `(buffer.size() * sizeof(decltype(buffer)::value_type))` and `.data()`.