# Build Failure Analysis: 2025_03_19_patch_952

## First error

../../chrome/browser/media/webrtc/tab_desktop_media_list_unittest.cc:79:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to construct a span from a raw pointer.

## Reason
The code is attempting to assign a raw pointer to a `base::span<uint8_t>`. `base::span` does not have an implicit conversion from a raw pointer. The rewriter should generate code to explicitly construct a `base::span` from the raw pointer and its size.

## Solution
The rewriter should change:

```c++
base::span<uint8_t> pixels_data =
      reinterpret_cast<uint8_t*>(result.getPixels());
```

to:

```c++
base::span<uint8_t> pixels_data(reinterpret_cast<uint8_t*>(result.getPixels()), result.width() * result.height() * 4);
```

Note that the number `4` in the above is the number of bytes per pixel.

## Note
`SkBitmap::getPixels()` returns a raw pointer.