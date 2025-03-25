# Build Failure Analysis: 2025_03_19_patch_676

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
      |   ~~~~~~~~~~~~~~~~~~^~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is passing `chunk`, which is now a `std::array`, to a function `getter.Run` that expects a raw pointer (`hb_ot_math_glyph_variant_t*`). The rewriter converted the raw array `HarfBuzzRecordType chunk[kMaxHarfBuzzRecords]` to `std::array<HarfBuzzRecordType, kMaxHarfBuzzRecords>`, but did not update the call site to pass a raw pointer.

## Solution
The rewriter needs to automatically add `.data()` to the argument when passing a `std::array` to a function that expects a raw pointer. This is similar to other cases where the rewriter must add `.data()` after rewriting to use `std::array` or `base::span`.

In this case:

```c++
 std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
                         0 /* start_offset */, &count, chunk);
```

should become:

```c++
 std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
                         0 /* start_offset */, &count, chunk.data());