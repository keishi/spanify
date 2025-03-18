# Build Failure Analysis: 2025_03_14_patch_266

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:278:31: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 16UL>' (aka 'const array<unsigned char, 16UL>') and 'unsigned long')
  278 |                   kExpectedIv + (kExpectedIv.size() *
      |                   ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code was concatenating a `char[]` with a `std::string`. Converting the char array to `std::array` broke this. The rewriter should recognize this pattern and add `.data()`.

## Solution
The rewriter needs to recognize this pattern and add `.data()` when an arrayified char[] is used with std::string concatenation.

```cpp
-  EXPECT_EQ(std::string(kExpectedIv, kExpectedIv + sizeof(kExpectedIv)),
+  EXPECT_EQ(std::string(kExpectedIv.data(),
+                  kExpectedIv + (kExpectedIv.size() *
+                                 sizeof(decltype(kExpectedIv)::value_type))),
+      decrypt_config->iv());
```

## Note
The error occurs due to trying to perform pointer arithmetic on the `std::array` object `kExpectedIv`. To fix this, the rewriter needs to ensure `.data()` is called on the `std::array` before attempting to construct the `std::string`. This is because std::string expects a `const char*` or similar, but gets a `std::array` object instead.