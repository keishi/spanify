# Build Failure Analysis: 2025_05_02_patch_1432

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 2016, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2022, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))` and also add `.data()` to decay the array to a pointer. Because both rewrites affect the same region of code, they overlap, causing a conflict.

## Solution
The rewriter should avoid adding `.data()` if `sizeof` is already being replaced with `(buffer.size() * sizeof(decltype(buffer)::value_type))`.

## Note