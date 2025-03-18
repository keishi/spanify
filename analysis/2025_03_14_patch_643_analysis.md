# Build Failure Analysis: 2025_03_14_patch_643

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:462:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  462 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `test_binary` from a `char[]` to `std::array<char, kBinaryLength>`.  The `ProgramBinaryEmulator` constructor takes a `const char*` as its third argument. The rewriter did not add `.data()` to the `test_binary` argument when constructing the `ProgramBinaryEmulator` object.

## Solution
The rewriter needs to add `.data()` to arrayified `char[]` variable used with std::array when that variable is passed to a function.
The rewritten code should be:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
None