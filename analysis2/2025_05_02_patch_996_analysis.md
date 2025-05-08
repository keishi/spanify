# Build Failure Analysis: 2025_05_02_patch_996

## First error

../../media/base/vector_math_perftest.cc:168:3: error: no matching member function for call to 'RunBenchmark'
  168 |   RunBenchmark(vector_math::FMUL_C, true, "_fmul", "unoptimized");
      |   ^~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:58:8: note: candidate function not viable: no known conversion from 'void (const float *, float, int, base::span<float>)' to 'void (*)(const float *, float, int, float *)' for 1st argument
   58 |   void RunBenchmark(void (*fn)(const float[], float, int, float[]),

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `FMUL_C`'s `dest` parameter, but did not update the call site in `vector_math_perftest.cc`. The `RunBenchmark` function expects a function pointer that takes a `float[]` as the fourth argument, but `FMUL_C` now takes a `base::span<float>`. The types do not match, resulting in a compile error.

## Solution
The rewriter spanified a function, but failed to spanify a call site. The rewriter needs to spanify the call site in `vector_math_perftest.cc` to accept `base::span`.

## Note
None