# Build Failure Analysis: 2025_03_14_patch_2007

## First error

../../mojo/core/message_unittest.cc:1123:71: error: invalid operands to binary expression ('std::array<MojoHandle, 5>' (aka 'array<unsigned long, 5>') and 'int')

## Category
Rewriter needs to add .data() when modifying pointer arithmetic on arrayified variables.

## Reason
The rewriter converted `MojoHandle handles[5];` to `std::array<MojoHandle, 5> handles;`. The code then attempts to perform pointer arithmetic: `handles + 1`. However, pointer arithmetic is not valid on `std::array` objects, only raw pointers. To fix this, `.data()` should be called on `handles` first.

## Solution
When the rewriter converts a C-style array to `std::array` and that array is used in pointer arithmetic, the rewriter needs to add `.data()` to the `std::array` variable in order to get a raw pointer to the underlying buffer.

## Note
There are multiple errors. They are likely related.
```
../../mojo/core/message_unittest.cc:1123:71: error: invalid operands to binary expression ('std::array<MojoHandle, 5>' (aka 'array<unsigned long, 5>') and 'int')
../../mojo/core/message_unittest.cc:1128:71: error: invalid operands to binary expression ('std::array<MojoHandle, 5>' (aka 'array<unsigned long, 5>') and 'int')