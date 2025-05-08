# Build Failure Analysis: 2025_05_02_patch_324

## First error

../../ui/gfx/skbitmap_operations.cc:450:7: error: cannot initialize an array element of type 'const LineProcessor' (aka 'void (*const)(const color_utils::HSL &, const unsigned int *, unsigned int *, int)') with an lvalue of type 'void (const color_utils::HSL &, const SkPMColor *, base::span<SkPMColor>, int)' (aka 'void (const color_utils::HSL &, const unsigned int *, span<unsigned int>, int)'): type mismatch at 3rd parameter ('SkPMColor *' (aka 'unsigned int *') vs 'base::span<SkPMColor>' (aka 'span<unsigned int>'))
  450 |       LineProcHnopSnopLdec, // L: kOpLDec
      |       ^~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The `LineProcHnopSnopLdec` function was spanified, changing the third parameter from `SkPMColor*` to `base::span<SkPMColor>`. However, the function pointer `LineProcessor` which takes `SkPMColor*` as argument, is incompatible with spanified `LineProcHnopSnopLdec`, resulting in type mismatch. The rewriter failed to spanify the call site, where the function pointer is used.

## Solution
The rewriter needs to spanify the function pointer `LineProcessor` to accept the spanified version of the function `LineProcHnopSnopLdec`.

## Note
The signature of `LineProcessor` is `typedef void (*LineProcessor)(const color_utils::HSL& hsl_shift, const SkPMColor* in, SkPMColor* out, int width);`.

The `LineProcessors` array is initialized with different line processing functions, which need to be updated to be compatible with the spanified `LineProcHnopSnopLdec`.