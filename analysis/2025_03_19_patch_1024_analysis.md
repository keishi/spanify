# Build Failure Analysis: 2025_03_19_patch_1024

## First error

../../chrome/browser/media/webrtc/desktop_media_picker_utils.cc:38:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified pixels_data, but failed to recognize that `result.getPixels()` returns a raw pointer which isn't implicitly convertible to a span.

## Solution
The rewriter should generate a span from `result.getPixels()` by specifying the size.

```cpp
   base::span<uint8_t> pixels_data(reinterpret_cast<uint8_t*>(result.getPixels()), result.rowBytes() * result.height());
```

## Note