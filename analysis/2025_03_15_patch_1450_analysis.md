# Build Failure Analysis: 2025_03_15_patch_1450

## First error

../../media/gpu/test/video_encoder/video_encoder_test_environment.cc:82:34: error: no matching function for call to 'to_array'

## Category
Rewriter needs to avoid rewriting if the replacement causes errors.

## Reason
The rewriter blindly replaced `double bitrate[2][3]` with `std::array<std::array<double, 3>, 2> bitrate`, which then broke the `std::to_array` call since it cannot be used to construct a nested array.

## Solution
The rewriter needs to avoid doing the conversion if the variable is later used with `std::to_array`. Or alternatively it can produce an additional replacement to fix it.

## Note
None