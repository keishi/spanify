# Build Failure Analysis: 2025_03_19_patch_358

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:636:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  636 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was rewritten to use `std::array` instead of a C-style array for `test_binary`. The constructor of `ProgramBinaryEmulator` expects a `const char* binary` as the third argument. The rewriter did not add `.data()` to the `test_binary` argument when calling the constructor, causing a type mismatch.

## Solution
The rewriter needs to add `.data()` to the `test_binary` argument in the constructor call to `ProgramBinaryEmulator`.

## Note
The diff shows the rewrite from `char test_binary[kBinaryLength];` to `std::array<char, kBinaryLength> test_binary;`, indicating that the rewriter did not handle the `.data()` conversion when calling the constructor.