# Build Failure Analysis: 2025_05_02_patch_1434

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 3083, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 3089, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))` because it thinks `buffer` is a C-style array. At the same time, it adds `.data()` to `buffer` because it's being passed to a function that expects a pointer. These two rewrites overlap, causing the error.

## Solution
The rewriter should avoid generating overlapping replacements. It needs to be smarter about the order in which it applies rewrites, or detect when rewrites will conflict. The current design is flawed as it generates all rewrites first, and then applies them without checking for conflicts.

## Note
The overlapping replacements are:
- `(buffer.size() * sizeof(decltype(buffer)::value_type))` at offset 3083
- `.data()` at offset 3089