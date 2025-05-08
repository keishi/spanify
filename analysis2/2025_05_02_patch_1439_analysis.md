# Build Failure Analysis: 2025_05_02_patch_1439

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5618, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5624, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite `sizeof(buffer)` using `RewriteArraySizeof` and also attempting to append `.data()` to `buffer` using `AppendDataCall`.  The `RewriteArraySizeof` rewrite generates code that calculates the size of the array and replaces `sizeof(buffer)` with `(buffer.size() * sizeof(decltype(buffer)::value_type))`. The `AppendDataCall` rewrite adds `.data()` to the variable `buffer`, which overlaps with the `RewriteArraySizeof` replacement.

## Solution
The rewriter should avoid applying both `RewriteArraySizeof` and `AppendDataCall` to the same variable. The rewriter should either prevent `sizeof` operator when the buffer variable also needs a `.data()` call, or add logic to ensure that these two rewrites do not overlap.

## Note
The expression `base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer)` looks incorrect. It should have been `buffer.data()` and `sizeof(buffer)` should have been translated to `buffer.size() * sizeof(decltype(buffer)::value_type)`.