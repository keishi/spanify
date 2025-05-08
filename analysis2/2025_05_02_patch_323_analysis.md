```
# Build Failure Analysis: 2025_05_02_patch_323

## First error

../../ui/gfx/skbitmap_operations.cc:450:7: error: cannot initialize an array element of type 'const LineProcessor' (aka 'void (*const)(const color_utils::HSL &, const unsigned int *, unsigned int *, int)') with an lvalue of type 'void (const color_utils::HSL &, base::span<const SkPMColor>, SkPMColor *, int)' (aka 'void (const color_utils::HSL &, span<const unsigned int>, unsigned int *, int)'): type mismatch at 2nd parameter ('const SkPMColor *' (aka 'const unsigned int *') vs 'base::span<const SkPMColor>' (aka 'span<const unsigned int>'))

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `LineProcHnopSnopLdec` function, but the function pointer `LineProcess` in `gfx/skbitmap_operations.cc` uses the old signature. The error message indicates a type mismatch because the function pointer expects a `const SkPMColor*` (aka `const unsigned int*`) as the second parameter, but the spanified function now takes a `base::span<const SkPMColor>` (aka `span<const unsigned int>`).

## Solution
The rewriter spanified a function, but failed to spanify a call site. In this case, the `LineProcess` array should also be updated to take `base::span<const SkPMColor>` arguments.

## Note