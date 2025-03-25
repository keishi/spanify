# Build Failure Analysis: 2025_03_19_patch_1927

## First error

../../third_party/blink/renderer/platform/graphics/gpu/webgl_image_conversion_test.cc:95:16: error: no viable conversion from 'uint16_t *' (aka 'unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `WebGLImageConversionTest::UnpackPixels` was spanified. However, in the call site `WebGLImageConversionTest::convertBGRA8toRGBA8` the rewriter failed to convert `reinterpret_cast<uint16_t*>(source_data)` to `base::span<const uint16_t>`. It looks like the rewriter didn't know how to get the size of the array in the `reinterpret_cast`.

## Solution
The rewriter should be able to handle reinterpret casts to spanified function parameters. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Note
This failure occurs in webgl_image_conversion_test.cc, but it may also occur in webgl_image_conversion.cc.