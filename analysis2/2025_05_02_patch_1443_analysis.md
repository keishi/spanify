# Build Failure Analysis: 2025_05_02_patch_1443

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6840, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6846, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to both rewrite `sizeof(buffer)` and add `.data()` to the `buffer` variable, but the replacements overlap. The `RewriteArraySizeof` is triggered because the size of the rewritten array is being used.

## Solution
The rewriter needs to avoid overlapping replacements. It should prioritize the `.data()` insertion in this case, as it's more important for correctness. A more robust solution would involve analyzing the AST to determine the correct order of replacements and avoid conflicts. This could be done by only applying the RewriteArraySizeof if the variable hasn't already been rewritten to a `std::array`.

## Note
The rewriter also added `.subspan( sizeof).data()(buffer)` which is a syntax error.