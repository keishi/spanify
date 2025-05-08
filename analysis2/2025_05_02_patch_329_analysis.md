```
# Build Failure Analysis: 2025_05_02_patch_329

## First error

```
error: cannot initialize an array element of type 'const LineProcessor' (aka 'void (*const)(const color_utils::HSL &, const unsigned int *, unsigned int *, int)') with an lvalue of type 'void (const color_utils::HSL &, base::span<const SkPMColor>, SkPMColor *, int)' (aka 'void (const color_utils::HSL &, span<const unsigned int>, unsigned int *, int)')
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `LineProcHnopSdecLdec` was spanified, changing the type of the second argument from `const SkPMColor*` to `base::span<const SkPMColor>`. However, this function is used as an entry in an array of function pointers (`LineProcessor`). The other functions in this array have not been updated, leading to a type mismatch. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter should identify function pointer usages of spanified functions and update the function pointer type accordingly. Alternatively, it should avoid spanifying the function if it is used as a function pointer in a context where the type cannot be updated.

## Note
The error occurs because `LineProcHnopSdecLdec` is assigned to an element of `LineProcessors`.
```c++
using LineProcessor = void (*)(const color_utils::HSL& hsl_shift,
                               const SkPMColor* in,
                               SkPMColor* out,
                               int width);
static const LineProcessor LineProcessors[kNumBlendModes][kNumLineOps] = {
    {
        LineProcHnopSnopLnop,  // L: kOpLIden
        LineProcHnopSnopLinc,  // L: kOpLInc
        LineProcHnopSnopLdec,  // L: kOpLDec
    },
```
The other functions in `LineProcessors` should also be converted to spans.