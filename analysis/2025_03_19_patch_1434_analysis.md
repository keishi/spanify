```
# Build Failure Analysis: 2025_03_19_patch_1434

## First error

../../components/viz/test/gl_scaler_test_util.cc:170:36: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The return value of `SkBitmap::getAddr32` is being assigned to converted span. Rewriter needs to construct a span from the return value, but the size is hard to identify. SkBitmap is third party code and cannot be rewritten.
```c++
-        uint32_t* const pixels = result.getAddr32(0, y);
+        const base::span<uint32_t> pixels = result.getAddr32(0, y);
```

## Solution
The return value of `SkBitmap::getAddr32` cannot be rewritten to `base::span` automatically because the rewriter cannot determine the size of the span. The solution is to manually create a span variable from the return value of that function.

```c++
         uint32_t* const pixels_ptr = result.getAddr32(0, y);
+        const base::span<uint32_t> pixels(pixels_ptr, size.width());
         for (int x = 0; x < size.width(); ++x) {
           pixels[x] = cycle_as_rgba[x % cycle_as_rgba.size()];
         }
```

## Note
`SkBitmap::getAddr32` is a third party function that should not be spanified automatically. Third party code cannot be automatically rewritten. Therefore the rewriter should not spanify this function.