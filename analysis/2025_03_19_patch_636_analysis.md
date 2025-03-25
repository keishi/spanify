# Build Failure Analysis: 2025_03_19_patch_636

## First error

../../media/gpu/vaapi/vp9_vaapi_video_decoder_delegate.cc:180:7: error: static assertion failed due to requirement 'std::extent<std::array<std::array<bool, 4>, 8>, 0>() == std::extent<_VASegmentParameterVP9[8], 0>()': seg_param array of incorrect size

## Category
Rewriter dropped mutable qualifier.

## Reason
The original code had a mutable `bool feature_enabled[kNumSegments][SEG_LVL_MAX];`. However, the rewriter replaced it with `std::array<std::array<bool, SEG_LVL_MAX>, kNumSegments> feature_enabled;` which is not mutable. The build error occurred due to this missing `mutable` qualifier. A static assert checks that the sizes of the generated structs match. Because of the dropped `mutable` qualifier, the layout differs and the assert fails.

## Solution
The rewriter should preserve the `mutable` qualifier when rewriting arrays to `std::array`.

## Note
The root cause is in VP9Parser::ParseSegmentationParams. The static assert compares the sizeof two different structs, but the memory layout should be identical.