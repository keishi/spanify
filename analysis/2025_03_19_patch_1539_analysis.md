# Build Failure Analysis: 2025_03_19_patch_1539

## First error

../../services/image_annotation/public/cpp/image_processor_unittest.cc:45:29: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'const base::span<uint8_t>' (aka 'const span<unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function that this argument is being passed to was spanified, but this call site is passing a raw pointer where the size is not available. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should be able to handle size info unavailable rhs value. The rewriter failed to add constructor when there is an assignment like this:
```
const base::span<uint8_t> pixels =
      reinterpret_cast<uint8_t*>(out.getPixels());
```
## Note
```
../../services/image_annotation/public/cpp/image_processor_unittest.cc:48:15: error: expected unqualified-id
```
This secondary error is caused by the first.
```
pixels.subspan(row * out.rowBytes() + col * out.bytesPerPixel())
              .data();