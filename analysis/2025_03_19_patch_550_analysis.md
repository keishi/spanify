# Build Failure Analysis: 2025_03_19_patch_550

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:278:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
  278 |                   kExpectedIv + (kExpectedIv.size() *

## Category
Rewriter needs to add .data() to arrayified variable used with std::string.

## Reason
The rewriter converted `kExpectedIv` from a C-style array to `std::array`.
The code attempts to use pointer arithmetic on `kExpectedIv`, but it now requires the `.data()` method to access the underlying pointer.

## Solution
The rewriter needs to add `.data()` to `kExpectedIv` to allow pointer arithmetic to be performed. The code should be rewritten as:
```c++
std::string(kExpectedIv.data(),
                  kExpectedIv.data() + (kExpectedIv.size() *
                                 sizeof(decltype(kExpectedIv)::value_type))),
```

## Note
None