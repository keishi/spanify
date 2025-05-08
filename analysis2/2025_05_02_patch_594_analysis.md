# Build Failure Analysis: 2025_05_02_patch_594

## First error

Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 800, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 806, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to apply two replacements that overlap in the same region of the source code. This happens when the tool tries to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))` and also add `.data()` to `buffer` at the same time. Because the rewrite for `sizeof` includes part of the expression where `.data()` is being added, it leads to overlapping replacements.

## Solution
The rewriter needs to avoid overlapping replacements. Specifically, when rewriting `sizeof` of an array that is also being used in a context where `.data()` needs to be added, the tool should ensure the replacements don't overlap. One way to do this is to apply the `.data()` replacement first, and then rewrite the `sizeof` expression, taking into account the added `.data()`.

## Note
The error message "Overlapping replacements" is a strong indicator of this type of bug.