# Build Failure Analysis: 2025_03_14_patch_255

## First error

../../crypto/encryptor_unittest.cc:256:62: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'size_t' (aka 'unsigned long'))
  256 |   EXPECT_EQ(std::vector<uint8_t>(plaintext.data(), plaintext + plaintext_size),
      |                                                    ~~~~~~~~~ ^ ~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::vector.

## Reason
The code is trying to construct a `std::vector` from a `base::span` using pointer arithmetic (`plaintext + plaintext_size`). However, span + size is not a valid operation, but `plaintext.data() + plaintext_size` is. The spanification of the `plaintext` variable introduced this error.

## Solution
The rewriter needs to add `.data()` to the span variable when it is used in pointer arithmetic to construct a `std::vector`.
```c++
// Old:
EXPECT_EQ(std::vector<uint8_t>(plaintext.data(), plaintext + plaintext_size), decrypted_vec);

// New:
EXPECT_EQ(std::vector<uint8_t>(plaintext.data(), plaintext.data() + plaintext_size), decrypted_vec);
```

## Note
The second error is similar to the first, and the same fix should be applied to it.
```
../../crypto/encryptor_unittest.cc:292:53: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'int')
  292 |     EXPECT_EQ(0, memcmp(decrypted.data(), plaintext + offset, len));
      |                                           ~~~~~~~~~ ^ ~~~~~~
```