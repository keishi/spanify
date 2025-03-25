# Build Failure Analysis: 2025_03_19_patch_353

## First error
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:489:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  489 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was changed to use `std::array` instead of a C-style array for `test_binary`. However, the `ProgramBinaryEmulator` constructor expects a `const char*`. The rewriter failed to add `.data()` to the `test_binary` variable when passing it to the `ProgramBinaryEmulator` constructor. This resulted in a type mismatch because `test_binary` is now a `std::array<char, kBinaryLength>` object, not a `const char*`.

## Solution
The rewriter should add `.data()` to `test_binary` when passing it to the `ProgramBinaryEmulator` constructor. The corrected line should look like this:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
There are no other errors in the provided build log.