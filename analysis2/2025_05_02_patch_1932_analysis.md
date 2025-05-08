# Build Failure Analysis: 2025_05_02_patch_1932

## First error

```
Overlapping replacements: ./media/filters/chunk_demuxer_unittest.cc at offset 161921, length 19: "(kCuesHeader.size() * sizeof(decltype(kCuesHeader)::value_type))" and offset 161927, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements at overlapping locations. It's trying to rewrite `sizeof(kCuesHeader)` and also add `.data()` to the variable `kCuesHeader`. Since the replacements overlap, the tool reports an error. The `kCuesHeader` variable was converted into a `std::array`. The `RewriteArraySizeof` rewrite rule is triggered because `sizeof` is being called on the std::array. The `AppendDataCall` rewrite rule is triggered because `kCuesHeader` (now a std::array) is being passed to the `insert` function.

## Solution
The rewriter should avoid trying to rewrite `sizeof(kCuesHeader)` when `kCuesHeader` is a `std::array`.

## Note
None