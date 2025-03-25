# Build Failure Analysis: 2025_03_19_patch_698

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1510:37: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<const hb_glyph_info_t>' (aka 'span<const hb_glyph_info_t>')
 1510 |   base::span<const hb_glyph_info_t> glyph_infos =
      |                                     ^
 1511 |       hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `hb_buffer_get_glyph_infos` directly to a `base::span`.  However, `base::span` doesn't have an implicit conversion constructor from raw pointers; it needs to know the size of the buffer.  The `hb_buffer_get_glyph_infos` function returns a raw pointer without providing size information, so it cannot be directly converted to span.

## Solution
The rewriter should generate code to explicitly construct the `base::span` from the pointer returned by `hb_buffer_get_glyph_infos`.  The size information, however, must be obtained.  

```c++
  const unsigned num_glyphs = hb_buffer_get_length(harfbuzz_buffer);
  base::span<const hb_glyph_info_t> glyph_infos(
      hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr), num_glyphs);
```

Because `hb_buffer_get_length` is used to get the size, the complete rewrite in `ShapeResult::InsertRun` should look like this:

```c++
void ShapeResult::InsertRun(ShapeResult::RunInfo* run,
                            hb_buffer_t* harfbuzz_buffer) {
  DCHECK_GT(num_glyphs, 0u);

  const unsigned num_glyphs = hb_buffer_get_length(harfbuzz_buffer);
  base::span<const hb_glyph_info_t> glyph_infos =
      hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr), num_glyphs);
  const bool is_ltr =
      HB_DIRECTION_IS_FORWARD(hb_buffer_get_direction(harfbuzz_buffer));
```

## Note
The same problem occurs in `ShapeResult::RunInfo::LimitNumGlyphs`. The correct fix is to pass the span into the function rather than creating it inside the function. The compiler error will be fixed if you just apply the fix to `ShapeResult::InsertRun` because it will no longer need to include `base/containers/span.h`.