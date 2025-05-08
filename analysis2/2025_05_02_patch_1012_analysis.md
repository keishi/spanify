# Build Failure Analysis: 2025_05_02_patch_1012

## First error

../../media/base/vector_math.cc:114:5: error: return type 'void (*)(const float *, int, float *)' must match previous return type 'void (*)(const float *, int, base::span<float>)' when lambda expression has unspecified explicit return type
  114 |     return FCLAMP_SSE;
      |     ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `FCLAMP` is spanified, but `FCLAMP_SSE` is not spanified. Then the compiler is complaining that the return types don't match in the lambda expression. `FCLAMP_SSE` cannot be spanified because it is defined in `vector_math_sse.h`, and that file is excluded via `kSeparateRepositoryPaths`. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should not spanify `FCLAMP` because it calls `FCLAMP_SSE`.

## Note
The other two errors are consequences of the first error.