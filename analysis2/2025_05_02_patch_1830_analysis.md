```
# Build Failure Analysis: 2025_05_02_patch_1830

## First error

```
../../gpu/command_buffer/service/memory_program_cache_unittest.cc:516:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  516 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
      |                         ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a constructor call.

## Reason
The rewriter changed `char test_binary[kBinaryLength]` to `std::array<char, kBinaryLength> test_binary;`. The constructor of `ProgramBinaryEmulator` expects a `const char*` as the third argument, but now receives a `std::array`. The fix is to call `.data()` on the `std::array` to get a pointer to the underlying data.

## Solution
The rewriter needs to add `.data()` when a `std::array` is passed to a function that expects a `const char*`. The line should be rewritten as:
```c++
ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
None