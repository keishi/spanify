```
# Build Failure Analysis: 2025_03_19_patch_988

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1455:41: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<const hb_glyph_position_t>' (aka 'span<const hb_glyph_position_t>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `hb_buffer_get_glyph_positions` directly to a `base::span`. The rewriter should generate code that constructs a `base::span` from the raw pointer. The error message indicates that there's no viable conversion from `hb_glyph_position_t*` to `base::span<const hb_glyph_position_t>`. This is because the rewriter likely doesn't know the size of the buffer pointed to by `glyph_positions`.

## Solution
The rewriter should use `hb_buffer_get_length` to get the size and create a span.

```c++
  base::span<const hb_glyph_position_t> glyph_positions =
      base::span<const hb_glyph_position_t>(hb_buffer_get_glyph_positions(harfbuzz_buffer, nullptr), hb_buffer_get_length(harfbuzz_buffer));
```

## Note
None