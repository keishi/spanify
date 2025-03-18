# Build Failure Analysis: 2025_03_16_patch_771

## First error
../../crypto/sha2_unittest.cc:50:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter replaced `uint8_t output_truncated1[4]` with `std::array<uint8_t, 4> output_truncated1`. However, it did not add `.data()` when `output_truncated1` was passed as an argument to `crypto::SHA256HashString`. The function `crypto::SHA256HashString` is declared in `crypto/sha2.h` and is, therefore, considered third party code.

## Solution
The rewriter should add `.data()` when passing a `std::array` to a third party function, even when the original argument was a C-style array.

## Note
The original code used `sizeof(output_truncated1)` which is 4. The rewritten code attempts to use `(output_truncated1.size() * sizeof(decltype(output_truncated1)::value_type))` which is also 4. This part was rewritten correctly.

There are actually two function prototypes for `SHA256HashString` in `crypto/sha2.h`. The code is calling the overload that takes two arguments:

```c++
void SHA256HashString(std::string_view str,
                      void* output,
                      size_t output_len);
```