# Build Failure Analysis: 2025_03_14_patch_749

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1542:5: error: no viable conversion from 'const array<remove_cv_t<int>, 2UL>' (aka 'const array<int, 2UL>') to 'const GLint *' (aka 'const int *')
 1542 |     kArrayStride,
      |     ^~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code attempts to pass a `std::array<GLint, 2>` to a function that expects a `const GLint*`.  The rewriter converted a C-style array to `std::array`, but failed to add `.data()` when the array was passed to a function.

## Solution
The rewriter needs to add `.data()` when passing a `std::array` to a function that expects a raw pointer.

```c++
// Before
glUniformiv(location, 2, kArrayStride);

// After
glUniformiv(location, 2, kArrayStride.data());