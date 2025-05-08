# Build Failure Analysis: 2025_05_02_patch_827

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_vertical_data.cc:290:41: error: cannot increment value of type 'base::span<const Glyph>' (aka 'span<const unsigned short>')
  290 |        out_xy_array != end; UNSAFE_TODO(++glyphs, out_xy_array += 2)) {
      |                                         ^ ~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified the `glyphs` variable, but the `UNSAFE_TODO` macro (likely used for debugging or temporary workarounds) attempts to increment the span directly using `++glyphs`.  Spans are not directly incrementable like raw pointers.

## Solution
The rewriter should avoid spanifying `glyphs` if it's used in a context where pointer arithmetic (`++`) is performed directly on the variable. The ideal solution is to rewrite the loop into range-based for loop.

## Note
The diff uses the span `glyphs[0]` to access the Glyph. It is not an ideal use of span, but it doesn't trigger a compile error.