# Build Failure Analysis: 2025_05_02_patch_1820

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:236:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  236 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:43:3: note: candidate constructor not viable: no known conversion from 'std::array<char, kBinaryLength>' to 'const char *' for 3rd argument
   43 |   ProgramBinaryEmulator(GLsizei length,
      |   ^
   44 |                         GLenum format,
   45 |                         const char* binary)

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a function call.

## Reason
The code was rewritten to use `std::array` instead of a C-style array for `test_binary`. The `ProgramBinaryEmulator` constructor expects a `const char*` as the third argument (`binary`).  However, `test_binary` is now a `std::array<char, kBinaryLength>`, which is not directly convertible to `const char*`. The rewriter should have added `.data()` to `test_binary` to pass a pointer to the underlying array data.

## Solution
The rewriter should be modified to automatically add `.data()` when a `std::array` is passed to a function that expects a `const char*` (or similar pointer type).

In this specific case, the line:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
```

should be rewritten to:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
This is a common pattern when converting C-style arrays to `std::array`, so the rewriter needs to be able to handle it consistently.