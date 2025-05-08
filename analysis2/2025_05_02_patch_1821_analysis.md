# Build Failure Analysis: 2025_05_02_patch_1821

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:290:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  290 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code initializes `ProgramBinaryEmulator` with a `char*`. The rewriter converted `test_binary` to `std::array<char, kBinaryLength>`, but failed to add `.data()` when calling the constructor of `ProgramBinaryEmulator`.

## Solution
The rewriter should recognize this pattern and add `.data()` when a `std::array` is passed to a function that expects a `char*`.

For example, the code:
```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
```
should be rewritten to:
```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
The error message clearly states that there is no matching constructor because it expects `const char* binary` but receives `std::array<char, kBinaryLength>`.