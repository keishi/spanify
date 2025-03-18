# Build Failure Analysis: 2025_03_14_patch_637

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:236:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  236 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a non-third_party function call.

## Reason
The code was rewritten to use `std::array` instead of `char[]` for `test_binary`. The `ProgramBinaryEmulator` constructor expects a `const char*` as the third argument, but it is receiving a `std::array<char, kBinaryLength>`. The rewriter failed to add `.data()` to the `test_binary` variable when passing it to the `ProgramBinaryEmulator` constructor.

## Solution
The rewriter needs to add `.data()` when a `std::array` is passed to a non-third party function that expects a `const char*` argument.

The line:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
```

should be rewritten as:

```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
All the other errors in the log are cascading errors from this initial error.