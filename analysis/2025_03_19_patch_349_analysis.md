# Build Failure Analysis: 2025_03_19_patch_349

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:347:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  347 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The constructor of `ProgramBinaryEmulator` expects a `const char*` as the third argument, but the rewriter converted `test_binary` to `std::array<char, kBinaryLength>`.  The rewriter did not add `.data()` to the `std::array` when passing it to the constructor. `ProgramBinaryEmulator` is in the same file so it is not third party code.

## Solution
The rewriter should add `.data()` when converting a C-style array to `std::array` and the `std::array` is passed to a function expecting a `const char*`.

For example, change:

```c++
  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
```

to:

```c++
  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());