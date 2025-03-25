# Build Failure Analysis: 2025_03_19_patch_584

## First error

../../gpu/command_buffer/tests/gl_virtual_contexts_unittest.cc:200:53: error: member reference base type 'const uint8_t[4]' (aka 'const unsigned char[4]') is not a structure or union
  200 |                                           test.color.data(), nullptr));

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `uint8_t pixels_[256 * 4];` to a `std::array<uint8_t, 256 * 4> pixels_;`. Then, the code passes `pixels_` to `GLTestHelper::CheckPixels`, but the call site was not updated to use `pixels_.data()`. `GLTestHelper::CheckPixels` is third party code, so rewriter has to add .data() to spanified variable.

## Solution
The rewriter should add `.data()` when passing a `std::array` to a third-party function.

## Note
There are other similar errors in this patch.
```
../../gpu/command_buffer/tests/compressed_texture_test.cc:241:54: error: no matching function for call to 'CheckPixels'
    |                                                          ^~~~~~~~~~
../../gpu/command_buffer/tests/gl_ext_blend_func_extended_unittest.cc:203:61: error: no matching function for call to 'CheckPixels'
    |                                                             ^~~~~~~~~~~