# Build Failure Analysis: 2025_05_02_patch_1743

## First error

../../net/ntlm/ntlm_buffer_reader_unittest.cc:454:27: error: invalid operands to binary expression ('const std::array<uint8_t, 16>' (aka 'const array<unsigned char, 16>') and 'int')
  454 |   ASSERT_EQ(0, memcmp(buf + 4, av_pairs[0].buffer.data(), 8));
      |                       ~~~ ^ ~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `memcmp`.

## Reason
The rewriter transformed `buf` to `std::array`, but `memcmp` expects a `char*`. The fix is to use `.data()` to pass a pointer to the underlying array.

## Solution
Add `.data()` to the `buf` argument of `memcmp`. The line should read:
`ASSERT_EQ(0, memcmp(buf.data() + 4, av_pairs[0].buffer.data(), 8));`