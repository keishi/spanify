```
# Build Failure Analysis: 2025_03_14_patch_1129

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:577:31: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>' (aka 'span<hb_glyph_info_t>')
  577 |   base::span<hb_glyph_info_t> glyph_info =

## Category
Rewriter needs to construct a span from the raw pointer and size rather than assigning the pointer directly.

## Reason
The code is trying to assign a raw pointer (`hb_glyph_info_t*`) directly to a `base::span<hb_glyph_info_t>`. `base::span` doesn't have an implicit conversion constructor from a raw pointer. It needs both the pointer and the size to create a span. The code should use the hb_buffer length to create a valid span.

## Solution
Construct the `base::span` using the pointer obtained from `hb_buffer_get_glyph_infos` and the length from `hb_buffer_get_length`.

```c++
  unsigned num_glyphs = hb_buffer_get_length(range_data->buffer);
  hb_glyph_info_t* glyph_info_ptr =
      hb_buffer_get_glyph_infos(range_data->buffer, nullptr);

  base::span<const hb_glyph_info_t> glyph_info(glyph_info_ptr, num_glyphs);
```

## Note
The diff shows that this code is in a third_party/blink file, but it is important to fix this error to continue to test the tool. Also note that this error is new and not related to existing categories.