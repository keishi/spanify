# Build Failure Analysis: 2025_03_19_patch_356

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:585:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `char test_binary[kBinaryLength];` to `std::array<char, kBinaryLength> test_binary;` but failed to add `.data()` when passing `test_binary` to the constructor of `ProgramBinaryEmulator`. It is expecting a `const char* binary`.

## Solution
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call.

## Note
None