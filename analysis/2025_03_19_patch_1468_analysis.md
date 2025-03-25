# Build Failure Analysis: 2025_03_19_patch_1468

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:632:31: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>' (aka 'span<hb_glyph_info_t>')
  632 |   base::span<hb_glyph_info_t> glyph_info =

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified the `ComputeSlice` function and changed the type of `glyph_info` parameter to `base::span<const hb_glyph_info_t>`, but the rewriter failed to realize that the return type of `hb_buffer_get_glyph_infos()` is a raw pointer and needs to be converted to `base::span`. This raw pointer does have a size available from `hb_buffer_get_length()`.

## Solution
The rewriter needs to generate code to construct a span from the return value of `hb_buffer_get_glyph_infos()`, using `hb_buffer_get_length()` as the size.

```c++
// Before:
base::span<hb_glyph_info_t> glyph_info =
      hb_buffer_get_glyph_infos(range_data->buffer.Get(), nullptr);

// After:
base::span<hb_glyph_info_t> glyph_info(hb_buffer_get_glyph_infos(range_data->buffer.Get(), nullptr), hb_buffer_get_length(range_data->buffer.Get()));