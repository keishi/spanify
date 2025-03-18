```
# Build Failure Analysis: 2025_03_16_patch_905

## First error

../../ui/gfx/render_text_harfbuzz.cc:1850:13: error: no viable conversion from 'const value_type *' (aka 'const unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `SkiaTextRenderer::DrawPosText` was spanified, but the call site in `SkiaTextRenderer::DrawPosText` wasn't updated to use a span. Specifically, the code is trying to pass a raw pointer `&run.shape.glyphs[colored_glyphs.start()]` where a `base::span<const uint16_t>` is expected.
The definition of the `base::span` requires constructing a span from the raw pointer and the size.

## Solution
Update the call site to construct a `base::span` from the raw pointer and size.  Replace:

```c++
&run.shape.glyphs[colored_glyphs.start()], colored_glyphs.length()
```

with:

```c++
base::span(&run.shape.glyphs[colored_glyphs.start()], colored_glyphs.length())
```

## Note
The other changes in the patch already add `base/containers/span.h` as a dependency to the file and the span's `.data()` member is correctly used in other places.