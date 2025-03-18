# Build Failure Analysis: 2025_03_14_patch_1909

## First error

../../crypto/sha2_unittest.cc:94:3: error: no matching function for call to 'SHA256HashString'
   94 |   crypto::SHA256HashString(input2, output_truncated2,

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter converted `uint8_t output_truncated2[6]` to `std::array<uint8_t, 6> output_truncated2;`. However, the function `crypto::SHA256HashString` expects a `void*` as its second argument, which is the address of a buffer. When passing `output_truncated2` (a `std::array`) directly, there is no implicit conversion to a pointer.

## Solution
The rewriter needs to recognize when an arrayified variable is being passed to a function that expects a pointer. In such cases, the rewriter should add `.data()` to get the underlying pointer to the array's data.

## Note
The rewriter also made an incorrect change. `sizeof(output_truncated2)` would have been correct in the original code but `(output_truncated2.size() * sizeof(decltype(output_truncated2)::value_type))` is overly verbose. Ideally the rewriter should maintain the original code, so that the code is as readable as possible.
```