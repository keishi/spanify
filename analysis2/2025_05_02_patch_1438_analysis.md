# Build Failure Analysis: 2025_05_02_patch_1438

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5368, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5374, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))` using `RewriteArraySizeof`. Also, because `buffer` is passed to `data.assign`, the rewriter attempts to add `.data()` to `buffer` using `AppendDataCall`. However, the replacements overlap.

## Solution
The rewriter needs to avoid generating overlapping replacements. One solution is to prioritize `AppendDataCall` over `RewriteArraySizeof`.

## Note
There are no secondary errors.