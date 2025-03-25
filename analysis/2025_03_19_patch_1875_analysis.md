# Build Failure Analysis: 2025_03_19_patch_1875

## First error

../../crypto/sha2_unittest.cc:45:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was converted to use `std::array` instead of a C-style array. The `crypto::SHA256HashString` function expects a `void*` as the second argument, but when using `std::array`, the rewriter failed to add `.data()` to get the underlying pointer. As a result, the `std::array` object itself was being passed, leading to a type mismatch and the compile error.

## Solution
The rewriter should add `.data()` to arrayified variable when that variable is passed to a third_party function call. In this case, change:

```
crypto::SHA256HashString(input1, output1,
      (output1.size() * sizeof(decltype(output1)::value_type)));
```

to:

```
crypto::SHA256HashString(input1, output1.data(),
      (output1.size() * sizeof(decltype(output1)::value_type)));
```
to correctly pass the pointer to the array's data to the function.

## Note
The size calculation is also unnecessary here. The code can be simplified to use output1.size(). But this is not the root cause of the first error.