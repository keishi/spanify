# Build Failure Analysis: 2025_05_02_patch_836

## First error

../../media/renderers/shared_image_video_frame_test_utils.cc:131:24: error: no viable conversion from 'const value_type' (aka 'const std::array<const unsigned char, 3>') to 'const uint8_t *' (aka 'const unsigned char *')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter converted `kYuvColors` to `std::array`. However, the code attempts to assign an element of this array (which is `std::array<const uint8_t, 3>`) to a `const uint8_t*`. To fix this, we need to get the underlying data pointer using `.data()`. Because the left-hand side is a pointer, we need to add `.data()` to the right-hand side.

## Solution
The rewriter needs to add `.data()` to the spanified return value.

## Note
The same error appears twice in the log.