# Build Failure Analysis: 2025_03_14_patch_1131

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1179:31: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>' (aka 'span<hb_glyph_info_t>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign a raw pointer returned by `hb_buffer_get_glyph_infos()` directly to a `base::span`. The `base::span` requires an explicit construction with the pointer and size, but the rewriter isn't generating this code. The return type of `hb_buffer_get_glyph_infos` is a pointer, not a span, so an implicit conversion is not possible. The error message "no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>'" indicates this issue.

## Solution
The rewriter should generate code to construct a `base::span` explicitly, using the pointer returned by `hb_buffer_get_glyph_infos()` and the size `num_glyphs`.

The rewriter should generate:
```c++
base::span<hb_glyph_info_t> glyph_info(hb_buffer_get_glyph_infos(hb_buffer, &num_glyphs), num_glyphs);
```

## Note
The rest of the errors are related to the fact that the rewriter did not properly create the base::span, thus the -> operator does not work anymore.