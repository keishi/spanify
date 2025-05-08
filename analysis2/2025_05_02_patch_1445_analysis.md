# Build Failure Analysis: 2025_05_02_patch_1445

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 8047, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 8053, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to both replace `sizeof(buffer)` with `(buffer.size() * sizeof(decltype(buffer)::value_type))` and add `.data()` to the same expression. Because the `.data()` replacement is inserted at the end of the `buffer` variable, this results in overlapping replacements.

## Solution
The rewriter should avoid applying both `RewriteArraySizeof` and `AppendDataCall` to the same variable. It should add a condition so that when RewriteArraySizeof is called, AppendDataCall is not.

## Note