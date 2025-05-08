```
# Build Failure Analysis: 2025_05_02_patch_1435

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 3748, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 3754, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))` and add `.data()` to the spanified variable `buffer` at the same time. But the `.data()` replacement offset is within the range of the sizeof replacement, thus generating an overlapping replacement.

## Solution
The rewriter should avoid generating overlapping replacements. One way to do that is to apply the replacements in a specific order. For example, it could apply the `.data()` replacement first, and then apply the sizeof replacement.