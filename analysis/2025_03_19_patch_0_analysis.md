# Build Failure Analysis: 2025_03_19_patch_0

## First error

../../services/viz/public/cpp/compositing/bitmap_in_shared_memory_mojom_traits.cc:73:31: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code was trying to implicitly construct a `base::span<const uint8_t>` from a raw pointer (`const uint8_t*`). While `base::span` has constructors to facilitate this, the compiler couldn't find a suitable one in this context. This usually indicates that the size information is unavailable. In this particular case, SkBitmap::getPixels() returns a raw pointer and the size is not explicitly available at that line.

## Solution
The rewriter should be able to recognize when raw pointer is being assigned to a span and add additional code to help constructing a valid span. Specifically in this case, it can use `base::make_span` to construct the span.

```diff
--- a/services/viz/public/cpp/compositing/bitmap_in_shared_memory_mojom_traits.cc
+++ b/services/viz/public/cpp/compositing/bitmap_in_shared_memory_mojom_traits.cc
@@ -68,8 +70,8 @@
       return std::nullopt;
     }
 
-    auto* src_pixels = static_cast<const uint8_t*>(sk_bitmap.getPixels());
-    base::span<const uint8_t> src_pixels =
+    const uint8_t* src_pixels_ptr = static_cast<const uint8_t*>(sk_bitmap.getPixels());
+    base::span<const uint8_t> src_pixels = base::make_span(
         static_cast<const uint8_t*>(sk_bitmap.getPixels());
     size_t src_stride = sk_bitmap.rowBytes();
     auto* dst_pixels = static_cast<uint8_t*>(mapping.memory());
```

## Note
The rewriter missed the other uses of raw pointers for this span, so they also need to be fixed by adding `.data()` or creating a temporary span variable.
Specifically these lines are incorrect now.
```
         memcpy(dst_pixels, src_pixels.data(), min_row_bytes);
         src_pixels = src_pixels.subspan(src_stride);