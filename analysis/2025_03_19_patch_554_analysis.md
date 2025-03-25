# Build Failure Analysis: 2025_03_19_patch_554

## First error

../../media/formats/webm/webm_crypto_helpers_unittest.cc:89:32: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 8UL>' (aka 'const array<unsigned char, 8UL>') and 'unsigned long')
   89 |                         kKeyId + (kKeyId.size() *
      |                         ~~~~~~ ^ ~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter arrayified the `kKeyId` variable to `std::array`, and then tried to use pointer arithmetic on it. This is no longer valid, as `std::array` does not decay to a raw pointer. The expression `kKeyId + (kKeyId.size() * sizeof(decltype(kKeyId)::value_type))` attempts to perform pointer arithmetic on `kKeyId`, which is now a `std::array`, not a raw pointer.

## Solution
The rewriter needs to use `kKeyId.data()` to obtain a pointer to the underlying data buffer of the `std::array`, and then perform pointer arithmetic on that pointer. However, instead of pointer arithmetics, the code calculates the end pointer of the array to create a string. This is better solved by using `.begin()` instead of pointer.

```
-EXPECT_EQ(std::string(kKeyId, kKeyId + sizeof(kKeyId)),
+EXPECT_EQ(std::string(kKeyId.begin(), kKeyId + (kKeyId.size() *
+                                         sizeof(decltype(kKeyId)::value_type))),
```

should be

```
-EXPECT_EQ(std::string(kKeyId, kKeyId + sizeof(kKeyId)),
+EXPECT_EQ(std::string(kKeyId.begin(), kKeyId.end()),
```

## Note
The same issue appears at lines 220 and 256.