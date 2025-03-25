# Build Failure Analysis: 2025_03_19_patch_350

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:409:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  409 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code attempts to construct `ProgramBinaryEmulator` with a `std::array` as the third argument, but the constructor expects a `const char*`. The rewriter replaced a C-style array with `std::array`, but failed to add `.data()` to the argument at the call site. Since `ProgramBinaryEmulator` is a class in the same project, this is NOT considered a third party function call.

## Solution
The rewriter needs to be able to identify this pattern and add `.data()` when a `std::array` is passed as a `const char*` argument to a function's or constructor's parameter.

## Note
Since `ProgramBinaryEmulator` is not a third party code, consider spanifying it.