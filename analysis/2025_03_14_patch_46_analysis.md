# Build Failure Analysis: 2025_03_14_patch_46

## First error

../../ui/gfx/render_text_harfbuzz.cc:1850:13: error: no viable conversion from 'const value_type *' (aka 'const unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')

## Category
Rewriter needs to generate code to construct a span from the function parameter.

## Reason
The rewriter spanified the function parameter `const uint16_t* glyphs` to `base::span<const uint16_t> glyphs` in `DrawPosText`. However, at the callsite, the rewriter failed to generate code to construct a `base::span` from the underlying raw pointer when that spanified variable is passed to `memcpy`.

## Solution
The rewriter needs to construct a `base::span` from the raw pointer parameter `glyphs` when it's used at the call site of `memcpy`. Since base::span can implicitly construct itself from a pointer and a size, no special action is needed. Instead the logic spanifing the functions is broken, and the rewriter should be reverted.

## Note
The memcpy call site was:

```c++
memcpy(run_buffer.glyphs, glyphs.data(), glyph_count * sizeof(glyphs[0]));