# Build Failure Analysis: 2025_03_19_patch_61

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_vertical_data.cc:281:41: error: cannot increment value of type 'base::span<const Glyph>' (aka 'span<const unsigned short>')

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code is trying to increment a span, but subspan() needs to be used instead.

## Solution
Need to rewrite "++glyphs" as "glyphs = glyphs.subspan(1)".

## Note
None