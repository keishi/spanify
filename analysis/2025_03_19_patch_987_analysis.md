# Build Failure Analysis: 2025_03_19_patch_987

## First error

../../third_party/blink/renderer/platform/fonts/shaping/shape_result.cc:1322:70: error: invalid operands to binary expression ('base::span<const hb_glyph_info_t>' (aka 'span<const hb_glyph_info_t>') and 'unsigned int')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `IsSafeToBreakBefore` was spanified. However, the call site inside ShapeResult::ComputeGlyphPositions is performing pointer arithmetic (`glyph_infos + i`) on the spanified `glyph_infos` variable, which is an invalid operation. The spanified function expected a `base::span` argument, but a raw pointer with offset was provided.

## Solution
The rewriter should be able to automatically replace callsites such as these with `glyph_infos[i]`.

## Note
The second error is related to implicit casting, and there could be more errors related to this implicit casting. The first error is the most important one that describes the bug.