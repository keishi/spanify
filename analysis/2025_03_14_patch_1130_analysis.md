```
# Build Failure Analysis: 2025_03_14_patch_1130

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1181:35: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>')

## Category
Pointer passed into spanified function parameter.

## Reason
The code attempts to create a `base::span<hb_glyph_position_t>` directly from a raw pointer (`hb_glyph_position_t*`) returned by `hb_buffer_get_glyph_positions`.  The `base::span` constructor requires either a compatible range or a pointer and a size. Since a raw pointer isn't automatically convertible to a range, and the code doesn't provide the size to the span, the compilation fails.

## Solution
The rewriter should use the size `num_glyphs` to correctly construct the `base::span` from the raw pointer. In the for loop, use indexing of span `glyph_position[i].x_advance` rather than -> to access the members.

```c++
  base::span<hb_glyph_position_t> glyph_position(hb_buffer_get_glyph_positions(hb_buffer, nullptr), num_glyphs);
  glyphs.reserve(num_glyphs);
  for (size_t i = 0; i < num_glyphs; ++i, ++glyph_info) {
    Glyph glyph;
    glyph.glyph_id = glyph_info->codepoint;
    glyph.character = glyph_info->cluster;
    glyph.properties.owns_complex = glyph_info->mask & HB_GLYPH_FLAG_UNSAFE_TO_CONVERT;
    glyph.advance = {HarfBuzzPositionToFloat(glyph_position[i].x_advance),
                    -HarfBuzzPositionToFloat(glyph_position[i].y_advance)};
    glyph.offset = {HarfBuzzPositionToFloat(glyph_position[i].x_offset),
                   -HarfBuzzPositionToFloat(glyph_position[i].y_offset)}});
    glyphs.emplace_back(glyph);
  }

```

## Note
The code also needs to use indexing of span `glyph_position[i].x_advance` rather than `glyph_position->x_advance`.
The iterator increments ++glyph_info is not necessary as the glyph_info variable is directly derived from the loop index i.
There are multiple errors, but the fix is the same for all of them (replace `->` with `[index].`).