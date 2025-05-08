# Build Failure Analysis: 2025_05_02_patch_1931

## First error

../../services/viz/public/cpp/compositing/bitmap_in_shared_memory_mojom_traits.cc:73:31: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
   73 |     base::span<const uint8_t> src_pixels =
      |                               ^
   74 |         static_cast<const uint8_t*>(sk_bitmap.getPixels());

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The `sk_bitmap.getPixels()` function returns a raw pointer (`const uint8_t*`). The rewriter is attempting to directly assign this raw pointer to a `base::span<const uint8_t>`, but there's no implicit conversion between a raw pointer and a span. A `base::span` must be constructed with a size if the size cannot be determined. The rewriter doesn't know the size of the pixel data returned by `sk_bitmap.getPixels()`.

## Solution
The rewriter needs to generate code to construct a span from the raw pointer returned by `sk_bitmap.getPixels()`, and we know the size from the `byte_size` variable.
Rewrite this:
```c++
base::span<const uint8_t> src_pixels =
        static_cast<const uint8_t*>(sk_bitmap.getPixels());
```
To this:
```c++
base::span<const uint8_t> src_pixels(
        static_cast<const uint8_t*>(sk_bitmap.getPixels()), byte_size);
```
## Note
The size is available as the variable `byte_size`.