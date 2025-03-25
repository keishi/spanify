# Build Failure Analysis: 2025_03_19_patch_385

## First error

../../mojo/core/message_unittest.cc:1123:71: error: invalid operands to binary expression ('std::array<MojoHandle, 5>' (aka 'array<unsigned long, 5>') and 'int')
 1123 |   EXPECT_EQ(MOJO_RESULT_OK, MojoAppendMessageData(message, 0, handles + 1, 1,
      |                                                               ~~~~~~~ ^ ~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code uses `handles + 1` where `handles` has been converted to `std::array`. The `MojoAppendMessageData` function in mojo core is likely third party code, therefore we need to add `.data()` to the `std::array` variable, before adding an offset to it. The type of `handles` has changed from `MojoHandle*` to `std::array<MojoHandle, 5>`. Since `std::array` doesn't decay to a pointer like a C-style array, the expression `handles + 1` is no longer valid. The correct expression should be `handles.data() + 1`.

## Solution
The rewriter needs to add `.data()` to the variable. The original code is:
```c++
MojoAppendMessageData(message, 0, handles + 1, 1,
```
The code should be converted to:
```c++
MojoAppendMessageData(message, 0, handles.data() + 1, 1,
```

## Note
There is a second error in the same file, so this category will likely occur again.