# Build Failure Analysis: 2025_05_02_patch_1483

## First error

../../third_party/blink/renderer/platform/fonts/shaping/harfbuzz_shaper.cc:1233:35: error: no viable conversion from 'hb_glyph_position_t *' to 'base::span<hb_glyph_position_t>' (aka 'span<hb_glyph_position_t>')
 1233 |   base::span<hb_glyph_position_t> glyph_position =

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `hb_buffer_get_glyph_positions` to a `base::span`. The `base::span` needs to be constructed from the pointer and a size. The rewriter doesn't currently generate the code to create the span, it only changes the type of variable from `hb_glyph_position_t*` to `base::span<hb_glyph_position_t>`.

## Solution
The rewriter needs to generate code to create a `base::span` from the raw pointer returned from `hb_buffer_get_glyph_positions`. The `hb_buffer_get_glyph_positions` gets the size from the `hb_buffer`. This can be achieved by introducing a helper function:

```c++
template <typename T>
base::span<T> make_span(hb_buffer_t* buffer,
                       T* (*getter)(hb_buffer_t*, unsigned int*),
                       unsigned int* size) {
  return base::span<T>(getter(buffer, size), *size);
}
```

and rewriting the assignment as follows:

```c++
base::span<hb_glyph_position_t> glyph_position = make_span(
    hb_buffer, hb_buffer_get_glyph_positions, &num_glyphs);
```

## Note
There are follow-up errors caused by the initial error. The code is trying to use pointer arithmetic on `glyph_position` but it is now a `base::span`. And the code is trying to use `->` to access members of `glyph_position` but it should use `.`.