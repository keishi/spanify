# Build Failure Analysis: 2025_03_19_patch_1778

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1542:5: error: no viable conversion from 'const array<remove_cv_t<int>, 2UL>' (aka 'const array<int, 2UL>') to 'const GLint *' (aka 'const int *')
 1542 |     kArrayStride,
      |     ^~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function that this argument is being passed to was spanified, but this call site is passing a `std::array` where the function signature expects a raw pointer. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value. The original code had `const GLint kArrayStride[] = { 7, 8 };`

## Solution
The rewriter should recognize this pattern and use `.data()` to pass the `std::array` to the function call.

## Note
None