# Build Failure Analysis: 2025_03_19_patch_348

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:290:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was changed to use `std::array` instead of a C-style array. The constructor of `ProgramBinaryEmulator` expects a `const char*` as the third argument, but `std::array` does not implicitly convert to a `const char*`. The rewriter didn't add `.data()` to pass a pointer to the underlying array.

## Solution
The rewriter should recognize when a `std::array` is being passed to a function that expects a C-style array, and automatically add `.data()` to the `std::array` variable.

## Note
This is the only error.