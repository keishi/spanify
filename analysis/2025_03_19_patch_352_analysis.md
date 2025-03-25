# Build Failure Analysis: 2025_03_19_patch_352

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:462:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  462 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:43:3: note: candidate constructor not viable: no known conversion from 'std::array<char, kBinaryLength>' to 'const char *' for 3rd argument

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `char test_binary[kBinaryLength];` to `std::array<char, kBinaryLength> test_binary;`. However, the constructor of `ProgramBinaryEmulator` expects a `const char* binary`, and the rewriter did not add `.data()` to `test_binary` when passing it to the constructor.

## Solution
The rewriter should add `.data()` to the `test_binary` variable when it is passed to the `ProgramBinaryEmulator` constructor.

## Note