# Build Failure Analysis: 2025_03_19_patch_359

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:646:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `test_binary2` to `std::array`. But `ProgramBinaryEmulator`'s constructor takes a `const char*` as an argument. The rewriter failed to add `.data()` when passing the array to the constructor.

## Solution
The rewriter should add `.data()` when a `std::array` is passed as an argument where a `const char*` is expected.

For example, the rewriter should transform:

```c++
ProgramBinaryEmulator emulator2(kBinaryLength, kFormat, test_binary2);
```

to:

```c++
ProgramBinaryEmulator emulator2(kBinaryLength, kFormat, test_binary2.data());
```

## Note
No other errors were detected.