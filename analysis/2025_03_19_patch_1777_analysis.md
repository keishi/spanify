# Build Failure Analysis: 2025_03_19_patch_1777

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1541:5: error: no viable conversion from 'const array<remove_cv_t<int>, 2UL>' (aka 'const array<int, 2UL>') to 'const GLint *' (aka 'const int *')

## Category
Rewriter failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array to `std::array`, but it is being implicitly converted to a raw pointer in a function argument. The rewriter should have added `.data()` to the `std::array` variable to decay it to a raw pointer.

## Solution
The rewriter should add `.data()` to arrayified variable `kOffset` where it is being implicitly converted to raw pointer.
```diff
-   kOffset,
+   kOffset.data(),