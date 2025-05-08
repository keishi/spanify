# Build Failure Analysis: 2025_05_02_patch_1294

## First error

```
../../net/dns/dns_response_unittest.cc:71:41: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
   71 |   EXPECT_EQ(0x11u, parser.ReadName(data + 0x00, &out));
      |                                    ~~~~ ^ ~~~~
```

## Category
Rewriter needs to add .data() to arrayified variable used with pointer arithmetic.

## Reason
The code uses pointer arithmetic on the `data` variable, which has been converted to `std::array`. `std::array` does not directly support pointer arithmetic. The `ReadName` function expects a raw pointer (uint8_t*), but it is receiving `std::array`. The rewriter didn't add `.data()` to decay the `std::array` to a pointer.

## Solution
The rewriter should add `.data()` to the arrayified variable when it is used in pointer arithmetic expressions.

```
-  EXPECT_EQ(0x11u, parser.ReadName(data + 0x00, &out));
+  EXPECT_EQ(0x11u, parser.ReadName(data.data() + 0x00, &out));
```
## Note
The same error occurs multiple times in the file.
```
../../net/dns/dns_response_unittest.cc:75:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:78:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:81:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:85:41: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:86:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:87:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:88:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')
../../net/dns/dns_response_unittest.cc:92:40: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 25UL>' (aka 'const array<unsigned char, 25UL>') and 'int')