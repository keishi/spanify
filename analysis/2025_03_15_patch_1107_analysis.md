# Build Failure Analysis: 2025_03_15_patch_1107

## First error

../../chrome/browser/media/webrtc/native_desktop_media_list.cc:102:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
The rewriter is not handling implicit conversions from raw pointers to `base::span`.

## Reason
The code attempts to implicitly convert a `uint8_t*` obtained from `result.getPixels()` to a `base::span<uint8_t>`. However, there is no implicit conversion defined between raw pointers and `base::span`, resulting in a compile error. The notes show that the compiler tried various constructors of `base::span` and failed to find a viable one.

## Solution
The rewriter should insert code to explicitly construct the `base::span` from the raw pointer and the size. However, in this case, there is no size known at that location, only the rowBytes, but not the total size of the buffer. The correct solution is to ensure that the allocated size is passed to the `base::span` constructor, which is missing in this scenario. An alternative approach could involve using the `SkBitmap` directly with `libyuv::ARGBScale` if compatible.

## Note
The error clearly indicates that the raw pointer is not implicitly convertible to base::span<uint8_t>. The rewriter must explicitly generate code that constructs a base::span object.