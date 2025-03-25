```
# Build Failure Analysis: 2025_03_19_patch_1467

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:360:35: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>')
  360 |   base::span<hb_glyph_position_t> glyph_positions =
      |                                   ^
  361 |       hb_buffer_get_glyph_positions(buffer, &len);

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `hb_buffer_get_glyph_positions` returns a raw pointer `hb_glyph_position_t*`. The rewriter is trying to assign this raw pointer directly to a `base::span<hb_glyph_position_t>`, but it is not doing it correctly. The span needs a size in order to be constructed. The size is passed as an output parameter so it should be possible.

## Solution
The rewriter should generate code that creates a span from the returned pointer and the size.

```c++
  unsigned int len;
- hb_glyph_position_t* glyph_positions =
+ auto glyph_positions_ptr = hb_buffer_get_glyph_positions(buffer, &len);
+ base::span<hb_glyph_position_t> glyph_positions(glyph_positions_ptr, len);
```

## Note
The error log indicates that there is no viable constructor for `base::span` that accepts a raw pointer directly. The notes suggest possible constructors and point out the `hb_glyph_position_t *` does not satisfy `contiguous_range`.