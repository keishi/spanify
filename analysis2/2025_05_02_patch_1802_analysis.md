# Build Failure Analysis: 2025_05_02_patch_1802

## First error

../../chrome/browser/media/webrtc/desktop_media_picker_utils.cc:38:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter is directly assigning a `uint8_t*` returned by `result.getPixels()` to a `base::span<uint8_t>`.  The `base::span` doesn't have a constructor that directly takes a raw pointer in this context. The `result.getPixels()` returns a raw pointer. The rewriter should recognize that reinterpret_cast is happening and remove the conversion and create a span directly from `result.getPixels()`

## Solution
The rewriter should remove the reinterpret_cast when creating a span and rewrite this:
```c++
base::span<uint8_t> pixels_data =
      reinterpret_cast<uint8_t*>(result.getPixels());
```
to this:
```c++
base::span<uint8_t> pixels_data(static_cast<uint8_t*>(result.getPixels()), result.rowBytes() * result.height());
```

## Note
There's an additional issue in the original code: the size of the span needs to be specified, otherwise it doesn't work. It needs to be `result.rowBytes() * result.height()`.
```