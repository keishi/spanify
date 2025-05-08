# Build Failure Analysis: 2025_05_02_patch_1822

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:347:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter needs to add .data() to arrayified variable used with ProgramBinaryEmulator constructor.

## Reason
The code initializes a `ProgramBinaryEmulator` object with a C-style array. However, the spanify tool converted the C-style array `test_binary` to `std::array`. The constructor of `ProgramBinaryEmulator` expects a `const char*`, but it is receiving a `std::array<char, kBinaryLength>`. The rewriter should have added `.data()` to convert the `std::array` to a `const char*`.

## Solution
The rewriter should detect when an arrayified `std::array` variable is being passed to a function that expects a `const char*` and automatically add `.data()` to it.

## Note
N/A