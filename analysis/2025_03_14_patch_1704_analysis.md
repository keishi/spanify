# Build Failure Analysis: 2025_03_14_patch_1704

## First error

../../gpu/command_buffer/client/gles2_implementation_unittest.cc:68:3: error: no matching function for call to 'memcpy'

## Category
Pointer passed into spanified function parameter.

## Reason
The compiler error "no matching function for call to 'memcpy'" indicates that the arguments passed to `memcpy` do not match any of the available function signatures.

In the original code, `memcpy` was likely called with a raw pointer as the source. After the spanification changes, `memcpy` is now being called with a `base::span` as the source argument. The compiler cannot implicitly convert `base::span<uint8_t>` to `const void*`, which is required by the `memcpy` signature. The fix is to explicitly pass `expected_data.data()` as the source.

## Solution
The rewriter should apply the `.data()` fix to the arguments of the `memcpy` call.
```c++
memcpy(dst, array.data(), size);
```

## Note
Several additional `memcpy` calls in the same function also exhibit this error. All of them need to be updated for the `base::span` type.
```c++
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:713:17: error: no matching function for call to 'memcpy'
  713 |   EXPECT_EQ(0, memcmp(expected_data, &data[0], data.size()));
      |                 ~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<unsigned char>' to 'const void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^