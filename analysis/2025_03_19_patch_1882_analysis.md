# Build Failure Analysis: 2025_03_19_patch_1882

## First error

../../crypto/sha2_unittest.cc:113:3: error: no matching function for call to 'SHA256HashString'
  113 |   crypto::SHA256HashString(
      |   ^~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to a spanified return value.

## Reason
The first error is that the spanified `output3` variable of type `std::array<uint8_t, crypto::kSHA256Length>` is being passed as the second argument to the `crypto::SHA256HashString` function, which expects a `void*`. The rewriter is correctly arrayifying the variable, but needs to add `.data()` to the argument.

## Solution
The rewriter needs to recognize this pattern and add .data(). The correct code should be:
```c++
crypto::SHA256HashString(input3, output3.data(), sizeof(output3));
```

## Note
The rewriter is passing `(output3.size() * sizeof(decltype(output3)::value_type))` as the third argument to `crypto::SHA256HashString`. The original code was passing `sizeof(output3)`. `output3.size() * sizeof(decltype(output3)::value_type)` is functionally equivalent to `sizeof(output3)`. It seems that the rewriter is always using this expression.