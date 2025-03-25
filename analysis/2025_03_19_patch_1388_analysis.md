# Build Failure Analysis: 2025_03_19_patch_1388

## First error

../../components/viz/service/frame_sinks/video_capture/video_capture_overlay_unittest.cc:536:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  536 |           base::span<uint32_t> out = canonical_bitmap.getAddr32(0, row);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`SkBitmap::getAddr32` returns a raw pointer. The rewriter is assigning this raw pointer directly to a `base::span<uint32_t>`. The rewriter needs to generate code to construct a span from the return value of the third party function. The compiler error shows that there is no viable conversion from 'uint32_t *' to 'base::span<uint32_t>'. The span's constructor requires knowing the size of the buffer.

## Solution
The rewriter should wrap the call to `canonical_bitmap.getAddr32(0, row)` with a `base::span` constructor, since it is returning a raw pointer. The size of the buffer is unknown, so we can't use the array size.  However, we can rewrite the code to construct a subspan of the entire bitmap:

```c++
  536 |         base::span<uint32_t> out = base::span(canonical_bitmap.getAddr32(0, row), size.width());
```

## Note
`SkBitmap::getAddr32()` is third_party code so it can't be rewritten.