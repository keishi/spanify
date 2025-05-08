# Build Failure Analysis: 2025_05_02_patch_596

## First error

Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 2862, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2868, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to decay the span to a pointer when passing to `data.assign()`. However, it also tries to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))`. This results in overlapping replacements, since `.data()` needs to be added *outside* the `sizeof` expression, but the rewriter attempts to modify the code *inside* the sizeof expression.

## Solution
The rewriter needs to avoid applying both transformations at the same time and avoid overlapping replacements. It needs to only add `.data()` to the `buffer` variable.