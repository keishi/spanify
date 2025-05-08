# Build Failure Analysis: 2025_05_02_patch_762

## First error

../../gpu/command_buffer/tests/gl_copy_texture_CHROMIUM_unittest.cc:334:20: error: incompatible operand types ('uint8_t[4]' (aka 'unsigned char[4]') and 'std::array<uint8_t, 4>' (aka 'array<unsigned char, 4>'))

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
`getTextureDataAndExpectedRGBAs` function spanifies `expected_mask` without spanifying all call sites. The error occurs in the following line.

```c++
(alt ? alt_expected_color : expected_color)[j];
```

where `expected_color` can either be a `uint8_t[4]` or `std::array<uint8_t, 4>`.

## Solution
The rewriter should avoid spanifying `getTextureDataAndExpectedRGBAs` because `GLTestHelper::CheckPixels` in the same file has a raw pointer as an argument.

## Note