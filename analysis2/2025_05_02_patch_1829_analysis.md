```
# Build Failure Analysis: 2025_05_02_patch_1829

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:489:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  489 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:43:3: note: candidate constructor not viable: no known conversion from 'std::array<char, kBinaryLength>' to 'const char *' for 3rd argument
   43 |   ProgramBinaryEmulator(GLsizei length,
      |   ^
   44 |                         GLenum format,
   45 |                         const char* binary)
      |                         ~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array.

## Reason
The `ProgramBinaryEmulator` constructor expects a `const char*` as the third argument, but after the rewrite, `test_binary` is a `std::array<char, kBinaryLength>`.  The rewriter needs to add `.data()` to the `test_binary` argument when calling the `ProgramBinaryEmulator` constructor to pass a `const char*` instead of a `std::array`.

## Solution
The rewriter should add `.data()` to the `test_binary` argument in the `ProgramBinaryEmulator` constructor call. The correct code should be:
```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

The rewriter needs to recognize this pattern and add .data() to the `std::array` variable being passed to the function.