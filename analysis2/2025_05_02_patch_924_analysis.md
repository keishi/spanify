# Build Failure Analysis: 2025_05_02_patch_924

## First error

```
Overlapping replacements: ./components/favicon/core/favicon_database_unittest.cc at offset 55197, length 14: "(kBlob1.size() * sizeof(decltype(kBlob1)::value_type))" and offset 55203, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements to overlapping regions of the source code. The first replacement involves rewriting `sizeof(kBlob1)` to `(kBlob1.size() * sizeof(decltype(kBlob1)::value_type))`. The second replacement adds `.data()` to the variable `kBlob1`. Since the `.data()` replacement occurs within the bounds of the `sizeof` replacement, the replacements overlap. This usually happens because `kBlob1` is a `const unsigned char[]` being used to initialize vector data.

## Solution
The rewriter needs to avoid adding `.data()` when `sizeof` is also used in the same line. `std::vector` can be constructed using iterators, like `std::vector<unsigned char> data(kBlob1, kBlob1 + sizeof(kBlob1))`. When `kBlob1` is replaced with `kBlob1.data()`, this code will no longer compile. Thus the rewriter needs to understand the surrounding code context to make the proper replacements.

## Note
This error happens 20 times in the build log.