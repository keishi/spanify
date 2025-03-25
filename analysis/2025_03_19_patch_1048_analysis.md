# Build Failure Analysis: 2025_03_19_patch_1048

## First error

../../ui/gfx/skbitmap_operations.cc:150:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `SkBitmap::getAddr32` returns a raw pointer `uint32_t*`. The rewriter is failing to recognize that this raw pointer does not have size information available.

## Solution
The rewriter needs to recognize a size info unavailable rhs value. When assigning it, if the lhs is a span, this is not allowed because the span would have an unknown size.

## Note
The rewriter should not attempt this span conversion.