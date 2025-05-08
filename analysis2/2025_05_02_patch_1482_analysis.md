# Build Failure Analysis: 2025_05_02_patch_1482

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:629:31: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<hb_glyph_info_t>' (aka 'span<hb_glyph_info_t>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by the third-party function `hb_buffer_get_glyph_infos` to a `base::span`. The `base::span` constructor does not automatically convert from a raw pointer unless the size is known at compile time or there is size information available. `hb_buffer_get_glyph_infos` returns `hb_glyph_info_t *`. The rewriter should have generated code to construct a `base::span` from the raw pointer and the size.

## Solution
The rewriter should generate code to construct a `base::span` from the raw pointer and the number of glyphs.
The `num_glyphs` variable holds the size of the glyph buffer.
```c++
base::span<hb_glyph_info_t> glyph_info(
    hb_buffer_get_glyph_infos(range_data->buffer.Get(), nullptr), num_glyphs);
```

## Note
The rewriter also fails to handle the same issue on line 413:

```
../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:413:68: error: invalid parameter type 'const hb_glyph_info_t *' for argument 'glyph_info'
```

The fix is the same as described in Solution, but it needs to be implemented in `ComputeSlice` function instead of `ExtractShapeResults`.
```c++
BufferSlice ComputeSlice(RangeContext* range_data,
                         const ReshapeQueueItem& current_queue_item,
                         base::span<const hb_glyph_info_t> glyph_info,
                         unsigned num_glyphs,
                         unsigned old_glyph_index,
                         unsigned new_glyph_index)
```

The `ShapeRange` function definition should change too because it is passing glyph_info as an argument. The correct code should look like this:

```c++
BufferSlice ComputeSlice(RangeContext* range_data,
                         const ReshapeQueueItem& current_queue_item,
                         base::span<const hb_glyph_info_t> glyph_info,
                         unsigned num_glyphs,
                         unsigned old_glyph_index,
                         unsigned new_glyph_index)