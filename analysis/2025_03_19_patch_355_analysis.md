```
# Build Failure Analysis: 2025_03_19_patch_355

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:539:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `char test_binary[kBinaryLength];` to `std::array<char, kBinaryLength> test_binary;` but failed to add `.data()` when `test_binary` was passed to `ProgramBinaryEmulator`'s constructor.

```c++
ProgramBinaryEmulator(GLsizei length,
                      GLenum format,
                      const char* binary)
```

`ProgramBinaryEmulator` is part of `gpu/command_buffer/service`, so it is not third party code. But the category still applies.

## Solution
Add `.data()` to `test_binary` when it is passed to `ProgramBinaryEmulator`'s constructor.
In memory_program_cache_unittest.cc:

```diff
--- a/gpu/command_buffer/service/memory_program_cache_unittest.cc
+++ b/gpu/command_buffer/service/memory_program_cache_unittest.cc
@@ -536,7 +536,7 @@
   for (int i = 0; i < kBinaryLength; ++i) {
     test_binary[i] = i;
   }
-  ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary);
+  ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary.data());
   EXPECT_CALL(*mock_memory_program_cache_,
               LoadLinkedProgramFromMemoryCacheINTERNAL(_, _, _, _, _))
       .WillOnce(Invoke([&](uint32_t client_id, uint32_t program, GLenum format,

```

## Note
There are no extra errors.