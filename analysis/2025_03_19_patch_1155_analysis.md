# Build Failure Analysis: 2025_03_19_patch_1155

## First error

../../crypto/encryptor_unittest.cc:256:62: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'size_t' (aka 'unsigned long'))
  256 |   EXPECT_EQ(std::vector<uint8_t>(plaintext.data(), plaintext + plaintext_size),

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code `plaintext + plaintext_size` is performing pointer arithmetic on a span.  Since `plaintext` is now a span, the expression `plaintext + plaintext_size` is invalid, and it should be rewritten to `plaintext.data() + plaintext_size`.

## Solution
Apply `.data()` to a spanified variable that has pointer arithmetic performed on it. Update the logic to detect this pattern.

## Note
The second error is an example of the same issue.
```
../../crypto/encryptor_unittest.cc:292:53: error: invalid operands to binary expression ('base::span<const unsigned char>' and 'int')
  292 |     EXPECT_EQ(0, memcmp(decrypted.data(), plaintext + offset, len));