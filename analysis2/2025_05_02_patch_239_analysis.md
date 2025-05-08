# Build Failure Analysis: 2025_05_02_patch_239

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:92:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
   92 |                   kExpectedIv + (kExpectedIv.size() *

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The expression `kExpectedIv + (kExpectedIv.size() * sizeof(decltype(kExpectedIv)::value_type)))` attempts to compute the end pointer of the array `kExpectedIv`. However, `kExpectedIv` is now a `std::array`, and pointer arithmetic is not directly applicable to `std::array` objects. The code is trying to perform pointer arithmetic on a `std::array` object as if it were a raw C-style array. Since the `data()` was added, we also need to subspanify to pass the length parameter.

## Solution
The rewriter needs to generate a `.data()` call to get the raw pointer from the `std::array`, and also use subspan to pass the length parameter.

```c++
std::string(base::make_span(kExpectedIv).data(), kExpectedIv.size());
```

## Note