# Build Failure Analysis: 2025_05_02_patch_761

## First error

../../gpu/command_buffer/tests/gl_ext_blend_func_extended_unittest.cc:207:51: error: member reference base type 'uint8_t[4]' (aka 'unsigned char[4]') is not a structure or union
  207 |                                           1, color.data(), nullptr));
      |                                              ~~~~~^~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `uint8_t result[4]` to `base::span<uint8_t, 4> result` but `GLTestHelper::CheckPixels` was expecting a pointer to the first element, not a span. The rewriter should have added `.data()` to convert the span to a pointer.

## Solution
The rewriter should add `.data()` when an arrayified variable is used in a context that expects a pointer.

## Note
The same error appears in other files.