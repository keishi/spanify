# Build Failure Analysis: 2025_05_02_patch_1825

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:430:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a function call. But a bug in the rewriter prevented this from happening. The constructor `ProgramBinaryEmulator` takes a `const char*` as an argument, so we need to pass `test_binary.data()` instead of `test_binary`.

## Solution
The rewriter should add `.data()` when converting a C-style array to std::array and passing it to a function.
```
-  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
+  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());
```

## Note
None