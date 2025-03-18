```
# Build Failure Analysis: 2025_03_14_patch_71

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1503:37: error: no viable conversion from 'hb_glyph_info_t *' to 'base::span<const hb_glyph_info_t>' (aka 'span<const hb_glyph_info_t>')
 1503 |   base::span<const hb_glyph_info_t> glyph_infos =
      |                                     ^
 1504 |       hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `hb_buffer_get_glyph_infos` to a `base::span`. The rewriter should generate the code that constructs a `span` from a raw pointer. In this case, it should be similar to "Rewriter needs to generate code to construct a span from the return value of a third_party function.". The return value is assigned to a converted span. Rewriter needs to construct a span from the return value, but the size is hard to identify.

## Solution
The span can be constructed only if we have size information, so there needs to be a parameter for the size and a way to pass the number of glyphs to the parameter. The signature of hb_buffer_get_glyph_infos is `hb_glyph_info_t* hb_buffer_get_glyph_infos (hb_buffer_t *buffer, unsigned int *length)`. The `length` argument can be passed to the span constructor for size, and rewriter should use this function: `base::span<const hb_glyph_info_t>(hb_buffer_get_glyph_infos(harfbuzz_buffer, &length), length)`.

Here is the code:

```diff
diff --git a/third_party/blink/renderer/platform/fonts/shaping/shape_result.cc b/third_party/blink/renderer/platform/fonts/shaping/shape_result.cc
--- a/third_party/blink/renderer/platform/fonts/shaping/shape_result.cc
+++ b/third_party/blink/renderer/platform/fonts/shaping/shape_result.cc
@@ -1498,7 +1498,8 @@ void ShapeResult::InsertRun(ShapeResult::RunInfo* run,
                             hb_buffer_t* harfbuzz_buffer) {
   DCHECK_GT(num_glyphs, 0u);
  
-  const hb_glyph_info_t* glyph_infos =
+  unsigned int glyph_count = 0;
+  base::span<const hb_glyph_info_t> glyph_infos =
        hb_buffer_get_glyph_infos(harfbuzz_buffer, nullptr);
   const bool is_ltr =
        HB_DIRECTION_IS_FORWARD(hb_buffer_get_direction(harfbuzz_buffer));

```

## Note

The same issue is present in shape_result_inline_headers.h.

In third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1324, there is a similar issue. The parameter glyph_infos is a pointer, but is used as span, so the rewriter missed this raw pointer:

```c++
void ShapeResult::RunInfo::LimitNumGlyphs(
    unsigned start_glyph,
    unsigned* num_glyphs_in_out,
    unsigned* num_glyphs_removed_out,
    const bool is_ltr,
    base::span<const hb_glyph_info_t> glyph_infos) {
```

The rewriter should have also rewrite `const hb_glyph_info_t* glyph_infos` with span.