# Build Failure Analysis: 2025_03_19_patch_1901

## First error

../../ui/gfx/render_text_harfbuzz.cc:1850:13: error: no viable conversion from 'const value_type *' (aka 'const unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')
 1850 |             &run.shape.glyphs[colored_glyphs.start()], colored_glyphs.length());
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DrawPosText` in `SkiaTextRenderer` was modified to accept a `base::span<const uint16_t>` for the `glyphs` parameter. However, the rewriter failed to recognize that `&run.shape.glyphs[colored_glyphs.start()]` is a raw pointer, and the size information `colored_glyphs.length()` comes from a different variable. This pattern was not recognized during the conversion, resulting in a compilation error because a raw pointer cannot be directly converted to a `base::span` without providing the size information in compatible format. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to be able to recognize this pattern and generate the appropriate code to construct a `base::span` from the raw pointer and the size information. The size info is in `colored_glyphs.length()`, and the raw pointer is `&run.shape.glyphs[colored_glyphs.start()]`. So it needs to generate something like this:
```c++
base::span( &run.shape.glyphs[colored_glyphs.start()], colored_glyphs.length())
```
## Note
There's a secondary error in `ui/gfx/render_text_unittest.cc` which has a similar root cause.