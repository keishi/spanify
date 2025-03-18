# Build Failure Analysis: 2025_03_14_patch_1844

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1315:70: error: invalid operands to binary expression ('base::span<const hb_glyph_info_t>' (aka 'span<const hb_glyph_info_t>') and 'unsigned int')

## Category
Rewriter needs to handle spanified `base::span` variable in code where span element is used with an arithmetic operator.

## Reason
The code now operates on a `base::span<const hb_glyph_info_t>`, but the expression `glyph_infos + i` is attempting pointer arithmetic on the `base::span` object itself, not on the underlying data. The correct way to access an element at index `i` within the `base::span` is to use the `[]` operator.

## Solution
Modify the code to use the `[]` operator to access the elements within the span:

```c++
hb_glyph_flags_t flags = hb_glyph_info_get_glyph_flags(glyph_infos[i]);
```

The rewriter needs to recognize this pattern and perform the above replacement.

## Note
The secondary error occurs because the code is assigning a raw pointer to a span.
```c++
../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1446:37: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<const hb_glyph_info_t>' (aka 'span<const hb_glyph_info_t>')
 1446 |   base::span<const hb_glyph_info_t> glyph_infos =
      |                                     ^
```
The rewriter should use `base::make_span` with size in this case to prevent this error.
```c++
base::span<const hb_glyph_info_t> glyph_infos =
      base::make_span(hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr), hb_buffer_get_length(harfbuzz_buffer));