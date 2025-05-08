# Build Failure Analysis: 2025_05_02_patch_1511

## First error

../../ui/gfx/render_text_harfbuzz.cc:1858:13: error: no viable conversion from 'const value_type *' (aka 'const unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')
 1858 |             &run.shape.glyphs[colored_glyphs.start()], colored_glyphs.length());
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1024:13: note: candidate constructor not viable: no known conversion from 'const value_type *' (aka 'const unsigned short *') to 'std::initializer_list<value_type>' (aka 'initializer_list<unsigned short>') for 1st argument
 1024 |   constexpr span(std::initializer_list<value_type> il LIFETIME_BOUND)
      |             ^    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `SkiaTextRenderer::DrawPosText` was spanified, but the call site in `render_text_harfbuzz.cc` is passing a raw pointer `&run.shape.glyphs[colored_glyphs.start()]` and the size `colored_glyphs.length()`. The rewriter did not properly create a `base::span` from this raw pointer and size. This seems to be a bug with the rewriter where it failed to recognize a size info available rhs value.

## Solution
The rewriter needs to create a `base::span` from the raw pointer and size at the call site. The rewriter should have wrapped the argument with `base::span`.

```c++
base::span(run.shape.glyphs + colored_glyphs.start(), colored_glyphs.length());
```

## Note
None