# Build Failure Analysis: 2025_05_02_patch_881

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1538:18: error: no matching function for call to 'to_array'

## Category
Rewriter needs to be able to convert a variable to `std::to_array` instead of `std::array`.

## Reason
The rewriter is converting `const GLint kMatrixStride[] = { 9, 10 };` to `const auto kMatrixStride = std::to_array<GLint>({9, 10});`. The error message indicates there is no viable conversion from `const array<remove_cv_t<int>, 2UL>` to `const int *`. It seems like the rewriter should have used `std::array` instead of `std::to_array` here. `std::to_array` is meant to be used when inferring the size of the array, and in this case the size can be inferred by the compiler.

## Solution
The rewriter should use `std::array` instead of `std::to_array` if the initializer list can be automatically deduced.

## Note
None