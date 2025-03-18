# Build Failure Analysis: 2025_03_14_patch_1030

## First error

../../media/gpu/vaapi/vaapi_jpeg_encoder.cc:60:17: error: static assertion failed due to requirement 'std::extent<std::array<unsigned char, 64>, 0>() == std::extent<unsigned char[64], 0>()': Luminance quantization table size mismatch.

## Category
Rewriter needs to use `.data()` when accessing members of a spanified variable.

## Reason
The static assertion failure indicates a type mismatch in the sizes of `std::array` and a C-style array (`uint8_t[]`).  The original code was likely written with the assumption that `q_matrix->lum_quantiser_matrix` would have a similar layout and size of the `uint8_t value[]` array, so it used sizeof(). But after the spanification of JpegQuantizationTable::value, `sizeof(value)` became sizeof(std::array<...>) instead of `sizeof(uint8_t[kDctSize])`. That caused a static assert to fail because the sizes are different. The code was fixed by comparing value.size() to the std::extent of `q_matrix->lum_quantiser_matrix`, thus removing the need for sizeof.

## Solution
When checking the size of an array from a third party library it is necessary to use `.size()`. The rewriter should use the correct method for reading the size of an array or add `.data()`

## Note
The first fix was the incorrect one, it has been reverted so as to add the correct version.