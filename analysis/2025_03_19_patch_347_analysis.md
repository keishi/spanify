# Build Failure Analysis: 2025_03_19_patch_347

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:258:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `test_binary` from a C-style array to `std::array`. When the `test_binary` variable is passed into the `ProgramBinaryEmulator` constructor, the compiler throws an error because the constructor expects a `const char*`, but receives a `std::array<char, kBinaryLength>`. The rewriter should have added `.data()` to `test_binary` to resolve this type mismatch.

## Solution
Update the rewriter to add `.data()` when a converted `std::array` variable is passed to a function that expects a `const char*`.

## Note
The `ProgramBinaryEmulator` class is not third party code, so it is valid to rewrite it.