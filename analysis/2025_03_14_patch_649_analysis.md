# Build Failure Analysis: 2025_03_14_patch_649

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:636:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `char test_binary[kBinaryLength];` to `std::array<char, kBinaryLength> test_binary;`. However, the constructor of `ProgramBinaryEmulator` takes `const char* binary` as an argument. The rewriter should have added `.data()` to `test_binary` when calling the constructor.

## Solution
The rewriter should add `.data()` to the `test_binary` argument when calling the constructor of `ProgramBinaryEmulator`. The rewritten code should be `ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());`.

## Note
None