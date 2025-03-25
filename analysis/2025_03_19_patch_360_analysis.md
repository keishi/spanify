```
# Build Failure Analysis: 2025_03_19_patch_360

## First error

../../gpu/command_buffer/service/memory_program_cache_unittest.cc:667:25: error: no matching constructor for initialization of 'ProgramBinaryEmulator'
  667 |   ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary);

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code initializes `ProgramBinaryEmulator` with the `test_binary` variable, and the rewriter converted `test_binary` from `char[]` to `std::array<char, N>`. The constructor of `ProgramBinaryEmulator` takes a `const char*` as an argument, but the rewriter failed to add `.data()` to `test_binary` to convert it to a `const char*`.

## Solution
The rewriter should add `.data()` to the `test_binary` variable when it is being used to initialize `ProgramBinaryEmulator`.

```
--- a/gpu/command_buffer/service/memory_program_cache_unittest.cc
+++ b/gpu/command_buffer/service/memory_program_cache_unittest.cc
@@ -658,7 +660,7 @@
   const GLenum kFormat = 1;
   const int kProgramId = 10;
   const int kBinaryLength = 20;
-  char test_binary[kBinaryLength];
+  std::array<char, kBinaryLength> test_binary;
   for (int i = 0; i < kBinaryLength; ++i) {
     test_binary[i] = i;
   }
```
```
--- a/gpu/command_buffer/service/memory_program_cache_unittest.cc
+++ b/gpu/command_buffer/service/memory_program_cache_unittest.cc
@@ -664,7 +664,7 @@
 
   ProgramBinaryEmulator emulator1(kBinaryLength, kFormat, test_binary.data());
   EXPECT_EQ(kProgramId, emulator1.program_id());
   EXPECT_EQ(kFormat, emulator1.format());

```

## Note
The same error happens again at line 679.