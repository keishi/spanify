# Build Failure Analysis: 2025_05_02_patch_1831

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:539:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  539 |   ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary);
      |                         ^         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code initializes `ProgramBinaryEmulator` with `test_binary`. The constructor of `ProgramBinaryEmulator` expects a `const char* binary`.  After the change, `test_binary` is a `std::array<char, kBinaryLength>`. The rewriter converted the C-style array to `std::array`, but didn't add `.data()` to pass a `const char*`.

## Solution
The rewriter should add `.data()` when a `std::array<char, N>` is passed to a function that expects a `char*` or `const char*`.  The corrected code should be:

```c++
ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary.data());
```

## Note
None