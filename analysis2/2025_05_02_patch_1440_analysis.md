# Build Failure Analysis: 2025_05_02_patch_1440

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5868, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5874, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))` and also add `.data()` to the `buffer` variable to pass it to `base::span`. But the replacements overlap.

## Solution
The rewriter should avoid overlapping replacements. The rewriter should either rewrite the `sizeof` expression first and then add `.data()` or vice versa.

## Note