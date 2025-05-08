```
# Build Failure Analysis: 2025_05_02_patch_1442

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6515, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6521, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))` using `RewriteArraySizeof`.
It also tries to add `.data()` using `AppendDataCall`. The overlapping replacements occur because the ranges overlap.

## Solution
The rewriter should avoid applying both rewrites when the `AppendDataCall` will operate on the result of the `RewriteArraySizeof`.

## Note
The diff also contains invalid code: `base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer)`.