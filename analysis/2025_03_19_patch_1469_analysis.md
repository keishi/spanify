# Build Failure Analysis: 2025_03_19_patch_1469

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1237:35: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code retrieves a raw pointer `hb_glyph_position_t*` from `hb_buffer_get_glyph_positions`. The rewriter attempted to change the type of `glyph_position` to `base::span<hb_glyph_position_t>`, but there was no size information available at the call site. The function prototype of  `hb_buffer_get_glyph_positions` is:

```c
hb_glyph_position_t* hb_buffer_get_glyph_positions (hb_buffer_t *buffer,
					      unsigned int *length)
```

It returns a raw pointer and the length is returned through the argument `length`. The rewriter failed to recognize a size info unavailable rhs value in this case.

## Solution
The rewriter should use the variable `num_glyphs` as the size for creating the span. Change the rewriter to use the right API.

```c++
-  base::span<hb_glyph_position_t> glyph_position =
+  base::span<hb_glyph_position_t> glyph_position(hb_buffer_get_glyph_positions(hb_buffer, &num_glyphs), num_glyphs);
```

## Note
The rewriter also needs to rewrite how `glyph_position` is incremented to prevent these errors.

```
../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1240:50: error: cannot increment value of type 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>')
 1240 |   for (; num_glyphs; --num_glyphs, ++glyph_info, ++glyph_position) {

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1244:59: error: member reference type 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>') is not a pointer; did you mean to use '.'?
 1244 |         .advance = {HarfBuzzPositionToFloat(glyph_position->x_advance),

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1244:61: error: no member named 'x_advance' in 'base::span<hb_glyph_position_t>'
 1244 |         .advance = {HarfBuzzPositionToFloat(glyph_position->x_advance),