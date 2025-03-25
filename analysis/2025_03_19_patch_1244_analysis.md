# Build Failure Analysis: 2025_03_19_patch_1244

## First error

../../gpu/command_buffer/client/gles2_implementation_unittest.cc:68:3: error: no matching function for call to 'memcpy'
   68 |   memcpy(dst, array, size);
      |   ^~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code now passes a `base::span<uint8_t>` as the source argument to `memcpy`. `memcpy` expects a `const void*`, and while there is an implicit conversion from `uint8_t*` to `void*`, there is no implicit conversion from `base::span<uint8_t>` to `const void*`. The rewriter converted `uint8_t* expected_data = buf.data();` to `base::span<uint8_t> expected_data = buf;` but did not update the call to memcpy. Because the rewriter is touching both the definition and the use, it should perform a cast when it spanifies the definition.

## Solution
The rewriter should insert `.data()` on `expected_data` when calling `memcpy` to convert the span into a `const void*`.

```c++
// Old code:
memcpy(dst, array, size);

// New code:
memcpy(dst, array.data(), size);
```

## Note
There is a similar error on line 707 that should be addressed by the same fix.
```
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:707:17: error: no matching function for call to 'SetMemoryFromArray'
  707 |       .WillOnce(SetMemoryFromArray(
      |                 ^~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:707:17: note: candidate function not viable: no known conversion from 'const base::span<unsigned char>' to 'const unsigned char *' for 2nd argument
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:707:17: note: candidate function not viable: requires 4 arguments, but 3 were provided