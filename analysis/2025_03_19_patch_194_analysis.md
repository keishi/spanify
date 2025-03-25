# Build Failure Analysis: 2025_03_19_patch_194

## First error

../../media/gpu/vaapi/vp9_vaapi_video_encoder_delegate_unittest.cc:588:18: error: no viable conversion from 'const value_type' (aka 'const std::array<unsigned char, 4>') to 'const uint8_t *' (aka 'const unsigned char *')
  588 |   const uint8_t* expected_temporal_ids =
      |                  ^
  589 |       kTemporalLayerPattern[num_temporal_layers - 1];
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The original code uses a C-style array `kTemporalLayerPattern`, which was converted to `std::array`. The error indicates that the code is trying to assign an element of `kTemporalLayerPattern` (which is now a `std::array<uint8_t, 4>`) to a `uint8_t*`. Since the rewriter replaced the C-style array with `std::array`, it also needs to add `.data()` to the expression to get a pointer to the underlying data.

## Solution
The rewriter needs to add `.data()` to the expression `kTemporalLayerPattern[num_temporal_layers - 1]` to convert the `std::array` to a pointer.

## Note