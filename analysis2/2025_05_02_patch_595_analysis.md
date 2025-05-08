# Build Failure Analysis: 2025_05_02_patch_595

## First error

```
Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 2165, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2171, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))`.
At the same time, the rewriter tries to add `.data()` to the spanified variable `buffer` when it is being passed to `data.assign`. These two replacements overlap, causing the error.

## Solution
The rewriter needs to avoid overlapping replacements when rewriting `sizeof` and adding `.data()`. This can be done by ensuring that the ranges for these replacements do not intersect. The `AppendDataCall` rewrite should check if the variable is also being used in a `sizeof` expression and adjust the replacement range accordingly, or vice-versa.

## Note
The overlapping replacements are happening because the rewriter is attempting to rewrite both `sizeof(buffer)` and add `.data()` to `buffer` when it's used as an argument to `data.assign()`.