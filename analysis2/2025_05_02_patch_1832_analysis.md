# Build Failure Analysis: 2025_05_02_patch_1832

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:585:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  585 |   ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary);
      |                         ^         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The `ProgramBinaryEmulator` constructor expects a `const char*` for the binary data, but after the rewriter changed `test_binary` to `std::array`, it is now passing a `std::array<char, kBinaryLength>`. The rewriter should have added `.data()` to `test_binary` when constructing `ProgramBinaryEmulator`.

## Solution
Add `.data()` to `test_binary` when constructing `ProgramBinaryEmulator`.

## Note
```