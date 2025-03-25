# Build Failure Analysis: 2025_03_19_patch_1779

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1543:5: error: no viable conversion from 'const array<remove_cv_t<int>, 2UL>' (aka 'const array<int, 2UL>') to 'const GLint *' (aka 'const int *')

## Category
Rewriter failed to add .data() to a spanified return value.

## Reason
The code attempts to pass `kMatrixStride`, now a `std::array`, to a function that expects a `const GLint*`. The rewriter converted the C-style array to `std::array`, and the size info is available. However, it failed to add `.data()` to get a raw pointer.

## Solution
The rewriter needs to add `.data()` to the arrayified variable. The code should be `kMatrixStride.data(),`

## Note
```c++
   const auto kMatrixStride = std::to_array<GLint>({9, 10});
```

should be changed to

```c++
   const auto kMatrixStride = std::to_array<GLint>({9, 10}).data();