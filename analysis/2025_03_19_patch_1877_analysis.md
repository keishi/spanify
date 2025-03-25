```
# Build Failure Analysis: 2025_03_19_patch_1877

## First error

../../crypto/sha2_unittest.cc:50:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `uint8_t output_truncated1[4];` to `std::array<uint8_t, 4> output_truncated1;`. The function `crypto::SHA256HashString` expects a `void*` as the second argument. The rewriter needs to add `.data()` when that variable is passed to a third_party function call, but it did not.

## Solution
The rewriter should add `.data()` to the array variable when it is passed as an argument to a function that is not being rewritten.

```c++
 crypto::SHA256HashString(input1, output_truncated1.data(),
                           (output_truncated1.size() *
                            sizeof(decltype(output_truncated1)::value_type)));
```

## Note
No additional errors.