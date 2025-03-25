# Build Failure Analysis: 2025_03_19_patch_226

## First error

../../net/dns/dns_response_unittest.cc:123:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')
  123 |   EXPECT_EQ(0u, parser.ReadName(data + 0x00, &out));

## Category
Rewriter needs to add `.data()` to arrayified `char[]` variable used in pointer arithmetic.

## Reason
The code is trying to do pointer arithmetic on a `std::array`. The rewriter needs to add `.data()` to the `std::array` variable to get a pointer to the underlying data. The first error occurred on line 123 in `net/dns/dns_response_unittest.cc`, where `data` is a `std::array<uint8_t, 15>` and the code is trying to add an integer offset to it, which is not directly supported.

## Solution
The rewriter should modify the line to use `data.data()` instead of `data` in pointer arithmetic expressions. For example, the error on line 123 should be fixed by changing the code to:
```c++
EXPECT_EQ(0u, parser.ReadName(data.data() + 0x00, &out));
```

## Note
The rewriter needs to fix a similar problem on the other lines reported in the build failure.
```
../../net/dns/dns_response_unittest.cc:124:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')
../../net/dns/dns_response_unittest.cc:125:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')
../../net/dns/dns_response_unittest.cc:126:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')
../../net/dns/dns_response_unittest.cc:127:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')
../../net/dns/dns_response_unittest.cc:128:38: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 15UL>' (aka 'const array<unsigned char, 15UL>') and 'int')