# Build Failure Analysis: 2025_03_19_patch_346

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:236:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  236 |   ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call. But a bug in the rewriter prevented this from happening. The `ProgramBinaryEmulator`'s constructor takes in a `const char* binary` parameter. So the rewriter needs to append `.data()` to `test_binary`.

## Solution
The rewriter should be updated to recognize this pattern and add `.data()` to the argument.

## Note
The relevant code from the build failure is:

```
  const int kBinaryLength = 20;
-  char test_binary[kBinaryLength];
+  std::array<char, kBinaryLength> test_binary;
   for (int i = 0; i < kBinaryLength; ++i) {
     test_binary[i] = i;
   }
-  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary);
+  ProgramBinaryEmulator emulator(kBinaryLength, kFormat, test_binary.data());