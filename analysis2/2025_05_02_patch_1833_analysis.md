# Build Failure Analysis: 2025_05_02_patch_1833

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:607:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  607 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:43:3: note: candidate constructor not viable: no known conversion from 'std::array<char, kBinaryLength>' to 'const char *' for 3rd argument
   43 |   ProgramBinaryEmulator(GLsizei length,
      |   ^
   44 |                         GLenum format,
   45 |                         const char* binary)
      |                         ~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a constructor call.

## Reason
The code was rewritten to use `std::array` instead of a C-style array for `test_binary`. However, the `ProgramBinaryEmulator` constructor expects a `const char*` as the third argument, not a `std::array<char, kBinaryLength>`. The rewriter failed to insert `.data()` to convert the `std::array` to a raw pointer.

## Solution
The rewriter should be updated to recognize this pattern (constructor call with `std::array` argument where a `const char*` is expected) and automatically append `.data()` to the `std::array` variable.

```c++
// Original code:
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);

// Rewritten code:
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
None