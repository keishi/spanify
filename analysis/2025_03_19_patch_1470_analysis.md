# Build Failure Analysis: 2025_03_19_patch_1470

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1235:31: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>' (aka 'span<hb_glyph_info_t>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
`hb_buffer_get_glyph_infos` returns a raw pointer (`hb_glyph_info_t*`) and a size (`num_glyphs`). The rewriter is attempting to assign this raw pointer directly to a `base::span<hb_glyph_info_t>`, but there's no implicit conversion. The `base::span` needs to be constructed with both the pointer and the size. This call signature wasn't accounted for in the logic that constructs `base::span` from "size info unavailable" raw pointers.

## Solution
The rewriter needs to recognize this pattern where a function returns a raw pointer and a size, and construct a span from the pointer and size. Replace the rewriter logic to produce:
```c++
base::span<hb_glyph_info_t> glyph_info(hb_buffer_get_glyph_infos(hb_buffer, &num_glyphs), num_glyphs);
```
The rewriter will need to be able to recognize `hb_buffer_get_glyph_infos` so it can add the size argument to the span.

## Note
The subsequent errors happen because the code then treats glyph_info as a pointer and not as a struct. The error message `cannot increment value of type 'base::span<hb_glyph_info_t>'` is due to trying to use `++glyph_info`, and the other errors are due to using `glyph_info->member` instead of `glyph_info.member`.