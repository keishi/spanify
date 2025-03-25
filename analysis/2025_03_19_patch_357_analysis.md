# Build Failure Analysis: 2025_03_19_patch_357

## First error
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:607:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The constructor for `ProgramBinaryEmulator` expects a `const char*` as its third argument, but after the rewriter replaced `char test_binary[kBinaryLength]` with `std::array<char, kBinaryLength> test_binary`, the code is now passing a `std::array` directly. The rewriter failed to add `.data()` to convert the `std::array` to a `const char*`. Since `ProgramBinaryEmulator` is in third_party code, it shouldn't be rewritted.

## Solution
The rewriter needs to add `.data()` when passing a `std::array` to a third_party function that expects a `const char*`.

## Note
This is a regression.