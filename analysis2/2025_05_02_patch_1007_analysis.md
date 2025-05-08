# Build Failure Analysis: 2025_05_02_patch_1007

## First error

../../media/base/vector_math.cc:56:5: error: return type 'void (*)(const float *, float, int, float *)' must match previous return type 'void (*)(base::span<const float>, float, int, float *)' when lambda expression has unspecified explicit return type
   56 |     return FMAC_SSE;
      |     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FMAC_AVX2` was spanified, but the rewriter failed to update the function pointer. The code attempts to assign `FMAC_SSE`, which takes `const float*`, to a function pointer that now expects `base::span<const float>`.

## Solution
The rewriter must update function pointers whenever spanifying a function.

## Note
The other errors are secondary and caused by the first error. The errors are:
1. `reinterpret_cast from 'base::span<const float>' to 'uintptr_t' (aka 'unsigned long') is not allowed`.
2. `no matching function for call to 'strict_cast'`.