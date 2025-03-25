# Build Failure Analysis: 2025_03_19_patch_1989

## First error

../../chrome/browser/media/webrtc/native_desktop_media_list.cc:102:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')
  102 |   base::span<uint8_t> pixels_data =
      |                       ^
  103 |       reinterpret_cast<uint8_t*>(result.getPixels());

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to construct a `base::span<uint8_t>` from the raw pointer returned by `result.getPixels()`.  However, the compiler cannot implicitly convert a raw pointer to a span without knowing the size. In this case, `result.getPixels()` returns a `uint8_t*`, and there is no size information readily available to construct the `base::span`. In addition, `result.getPixels()` is a third_party function, and its size information cannot be easily identified.

## Solution
The rewriter needs to generate code that constructs the span, providing the data pointer and size. The rewritten code should pass the height and the rowBytes when constructing the pixels_data:

```c++
base::span<uint8_t> pixels_data(
    reinterpret_cast<uint8_t*>(result.getPixels()),
    result.rowBytes() * scaled_rect.height());
```

## Note
This looks like a similar error to the "Rewriter needs to generate code to construct a span from the return value of a third_party function" error.