# Build Failure Analysis: 2025_05_02_patch_325

## First error

../../ui/gfx/skbitmap_operations.cc:451:7: error: cannot initialize an array element of type 'const LineProcessor' (aka 'void (*const)(const color_utils::HSL &, const unsigned int *, unsigned int *, int)') with an lvalue of type 'void (const color_utils::HSL &, base::span<const SkPMColor>, SkPMColor *, int)' (aka 'void (const color_utils::HSL &, span<const unsigned int>, unsigned int *, int)'): type mismatch at 2nd parameter ('const SkPMColor *' (aka 'const unsigned int *') vs 'base::span<const SkPMColor>' (aka 'span<const unsigned int>'))

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `LineProcHnopSnopLinc`, but the code initializes an array of function pointers with `LineProcHnopSnopLinc`. Since the types no longer match, a compile error occurs.

## Solution
The rewriter should find all usages of the function to be spanified, and rewrite them accordingly.

## Note
There are no other errors in this build log.