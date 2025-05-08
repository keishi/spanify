```
# Build Failure: 2025_05_02_patch_240

## First error

```
../../media/formats/webm/webm_crypto_helpers_unittest.cc:248:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
  248 |                   kExpectedIv + (kExpectedIv.size() *
      |                   ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~
  249 |                                  sizeof(decltype(kExpectedIv)::value_type))),
      |                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code was rewritten to use `std::array` instead of a raw array for `kExpectedIv`. When using `std::string` constructor with the `std::array`, the second argument needs to be a pointer to the end of the data. The rewriter tried to compute the end pointer `kExpectedIv + (kExpectedIv.size() * sizeof(decltype(kExpectedIv)::value_type)))` which is incorrect. The size of `kExpectedIv` has to be converted to the same type as the pointer `kExpectedIv.data()`. In this case `kExpectedIv.size()` has to be cast to `size_t` type. Since we have a spanified return value (data()), the rewriter has to append `.data()` to it to avoid the error.

## Solution
The rewriter should add `.data()` to a spanified return value.

```c++
// Corrected code:
EXPECT_EQ(
      std::string(kExpectedIv.data(),
                  kExpectedIv.data() + (kExpectedIv.size() *
                                 sizeof(decltype(kExpectedIv)::value_type))),
      decrypt_config->iv());
```

## Note
N/A