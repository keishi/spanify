# Build Failure Analysis: 2025_03_14_patch_1845

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1448:41: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<const hb_glyph_position_t>' (aka 'span<const hb_glyph_position_t>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to directly assign the raw pointer returned by `hb_buffer_get_glyph_positions` to a `base::span`. The `base::span` doesn't have an implicit conversion from a raw pointer and requires the size to be specified. Since `hb_buffer_get_glyph_positions` returns a raw pointer and the size isn't available at the call site, the compiler reports "no viable conversion".

## Solution
The rewriter needs to wrap the raw pointer with `base::span` using the pointer and size.

```c++
  const hb_glyph_info_t* glyph_infos =
      hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr);
+  unsigned int glyph_count = hb_buffer_get_length(harfbuzz_buffer);
+
   base::span<const hb_glyph_position_t> glyph_positions =
-      hb_buffer_get_glyph_positions(harfbuzz_buffer, nullptr);
+      base::span<const hb_glyph_position_t>(hb_buffer_get_glyph_positions(harfbuzz_buffer, nullptr), glyph_count);
```

## Note
hb_buffer_get_length needs to be called to get the size, which will then be used to construct a span.