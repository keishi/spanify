# Build Failure Analysis: 2025_03_19_patch_354

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:516:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  516 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `test_binary` to `std::array`, but it is being passed to `ProgramBinaryEmulator` which expects a `const char*`. The rewriter should have added `.data()` when that variable is passed to a third_party function call. Since the class is not part of third party, then the rewriter should not spanify its constructor arguments.

## Solution
The rewriter should recognize this pattern and add .data() when a `char[]` variable is converted to `std::array` and then is passed into a function call. Alternatively, the function parameters should not have been spanified.

## Note
N/A