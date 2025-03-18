# Build Failure Analysis: 2025_03_15_patch_1638

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:462:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  462 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was changed to use `std::array` instead of a C-style array for `test_binary`. However, the `ProgramBinaryEmulator` constructor expects a `const char*`, and `std::array` doesn't implicitly convert to that. The rewriter needs to add `.data()` to `test_binary` to pass a `const char*` to the constructor.

## Solution
Change the line:
`ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);`
to:
`ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());`

## Note
No other errors were reported.