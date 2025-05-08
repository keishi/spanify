# Build Failure Analysis: 2025_05_02_patch_1834

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:636:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  636 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:43:3: note: candidate constructor not viable: no known conversion from 'std::array<char, kBinaryLength>' to 'const char *' for 3rd argument
   43 |   ProgramBinaryEmulator(GLsizei length,
      |   ^
   44 |                         GLenum format,
   45 |                         const char* binary)
      |                         ~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:41:7: note: candidate constructor (the implicit copy constructor) not viable: requires 1 argument, but 3 were provided
   41 | class ProgramBinaryEmulator {
      |       ^~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:41:7: note: candidate constructor (the implicit move constructor) not viable: requires 1 argument, but 3 were provided
   41 | class ProgramBinaryEmulator {
      |       ^~~~~~~~~~~~~~~~~~~~~
1 error generated.
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `test_binary` from a C-style array to `std::array`. The `ProgramBinaryEmulator` constructor expects a `const char*` as the third argument, but the rewriter did not add `.data()` to `test_binary` when passing it to the constructor. This resulted in a type mismatch, causing the compilation error.

## Solution
The rewriter should recognize that `test_binary` has been converted to `std::array` and append `.data()` when it is passed to a function that expects a `const char*`. The corrected code should be:
```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
N/A