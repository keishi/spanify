# Build Failure Analysis: 2025_03_15_patch_192

## First error

../../crypto/encryptor_unittest.cc:256:62: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'size_t' (aka 'unsigned long'))
  256 |   EXPECT_EQ(std::vector<uint8_t>(plaintext.data(), plaintext + plaintext_size),
      |                                                    ~~~~~~~~~ ^ ~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to spanified variable used with pointer arithmetic.

## Reason
The code is attempting to add a `base::span` to a `size_t`. This is an invalid operation, as `base::span` is not a pointer type and does not support pointer arithmetic directly. The original code likely added a `plaintext` which is a `const unsigned char*` with an offset. After spanification, `plaintext` is now a `base::span<const unsigned char>`, and pointer arithmetic must be done on the `.data()` member instead.

## Solution
The rewriter needs to add `.data()` to the span variable when it is used with pointer arithmetic. Specifically:

```
-plaintext + plaintext_size
+plaintext.data() + plaintext_size
```

## Note
The second error shows up on a call to memcmp.
```
../../crypto/encryptor_unittest.cc:292:53: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'int')
  292 |     EXPECT_EQ(0, memcmp(decrypted.data(), plaintext + offset, len));
      |                                           ~~~~~~~~~ ^ ~~~~~~

```