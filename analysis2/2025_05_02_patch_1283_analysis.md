# Build Failure Analysis: 2025_05_02_patch_1283

## First error

```
../../mojo/core/message_unittest.cc:1123:71: error: invalid operands to binary expression ('std::array<MojoHandle, 5>' (aka 'array<unsigned long, 5>') and 'int')
 1123 |   EXPECT_EQ(MOJO_RESULT_OK, MojoAppendMessageData(message, 0, handles + 1, 1,
      |                                                               ~~~~~~~ ^ ~
```

## Category
Rewriter replaced a C-style array with `std::array`, but did not properly update pointer arithmetic.

## Reason
The code originally used pointer arithmetic with a C-style array: `handles + 1`. After the rewriter changed `handles` to a `std::array`, this pointer arithmetic is no longer valid. `std::array` does not support pointer arithmetic in the same way as C-style arrays. The correct way to access the underlying data with an offset is to use `.data()`.

## Solution
When the rewriter changes a C-style array to `std::array`, it needs to update any pointer arithmetic to use `.data()` to get a raw pointer to the beginning of the array. The rewriter should change `handles + 1` to `handles.data() + 1` or `&handles[1]`.

## Note
The second error is the same as the first error, just on a different line.