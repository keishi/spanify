# Build Failure Analysis: 2025_03_19_patch_1907

## First error

../../net/ntlm/ntlm_buffer_reader_unittest.cc:454:27: error: invalid operands to binary expression ('const std::array<uint8_t, 16>' (aka 'const array<unsigned char, 16>') and 'int')
  454 |   ASSERT_EQ(0, memcmp(buf + 4, av_pairs[0].buffer.data(), 8));

## Category
Rewriter failed to add .data() to arrayified variable used with `memcmp`.

## Reason
The rewriter converted `uint8_t buf[16]` to `std::array<uint8_t, 16> buf`. However, the code uses `buf + 4` as the first argument to `memcmp`. The `memcmp` function expects a `void*` argument, and adding an integer to a `std::array` is not directly supported (unlike C-style arrays). The rewriter should have added `.data()` to `buf` before adding the offset to get a pointer to the underlying data.

## Solution
The rewriter needs to add `.data()` when an arrayified variable is used with `memcmp` and offset by some integer. The rewritten expression should be `buf.data() + 4`.

## Note
The rewriter spanified the buffer but did not update the call to memcmp.
```
-  ASSERT_EQ(0, memcmp(buf + 4, av_pairs[0].buffer.data(), 8));
+  ASSERT_EQ(0, memcmp(buf.data() + 4, av_pairs[0].buffer.data(), 8));