# Build Failure: 2025_05_02_patch_320

## First error

```
../../ui/gfx/skbitmap_operations.cc:459:7: error: cannot initialize an array element of type 'const LineProcessor' (aka 'void (*const)(const color_utils::HSL &, const unsigned int *, unsigned int *, int)') with an lvalue of type 'void (const color_utils::HSL &, base::span<const SkPMColor>, SkPMColor *, int)' (aka 'void (const color_utils::HSL &, span<const unsigned int>, unsigned int *, int)'): type mismatch at 2nd parameter ('const SkPMColor *' (aka 'const unsigned int *') vs 'base::span<const SkPMColor>' (aka 'span<const unsigned int>'))
  459 |       LineProcDefault, // L: kOpLNone
      |       ^~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `LineProcDefault` was spanified. However it is called inside a table of function pointers. Thus the rewriter needs to spanify the function pointer type as well.

## Solution
The rewriter should spanify the function pointer type `LineProcessor` so that the code compiles.

## Note
There are multiple errors of the same type.