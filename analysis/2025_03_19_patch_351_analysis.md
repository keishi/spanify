# Build Failure Analysis: 2025_03_19_patch_351

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:430:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  430 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter replaced `char[]` with `std::array`, but did not add `.data()` when the variable was passed to the `ProgramBinaryEmulator` constructor.

## Solution
The rewriter should recognize this pattern and add `.data()`.
```c++
   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());