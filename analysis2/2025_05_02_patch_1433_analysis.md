# Build Failure Analysis: 2025_05_02_patch_1433

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 2410, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2416, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap. First, it's trying to rewrite `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))`. Second, it's trying to add `.data()` to `buffer` when passing `buffer` to `data.assign`. The `.data()` replacement is contained entirely within the range of the `sizeof` replacement, causing the overlap.

## Solution
The rewriter should be refactored to avoid overlapping replacements. One way to address this specific case is to ensure that the `AppendDataCall` transformation is aware of the `RewriteArraySizeof` transformation and adjusts its replacement range accordingly. It can also be the case that the transformations should not be applied in this case.

## Note
The first error is an overlapping replacement.