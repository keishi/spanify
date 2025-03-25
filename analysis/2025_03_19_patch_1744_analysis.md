# Build Failure Analysis: 2025_03_19_patch_1744

## First error

../../mojo/core/data_pipe_unittest.cc:937:16: error: member reference base type 'int32_t[100]' (aka 'int[100]') is not a structure or union
  937 |   memset(buffer.data(), 0xab,

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `buffer` to `std::array<int32_t, 100>`, but failed to add `.data()` when the array is passed to the `memset` function, which expects a raw pointer.

## Solution
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call.

```diff
-  memset(buffer, 0xab, sizeof(buffer));
+  memset(buffer.data(), 0xab, (buffer.size() * sizeof(decltype(buffer)::value_type)));
```

## Note
This error repeats throughout the file.