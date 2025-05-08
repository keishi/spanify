# Build Failure Analysis: 2025_05_02_patch_1003

## First error

../../media/base/vector_math.cc:85:5: error: return type 'void (*)(const float *, float, int, base::span<float>)' must match previous return type 'void (*)(const float *, float, int, float *)' when lambda expression has unspecified explicit return type
   85 |     return FMUL_SSE;
      |     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function pointer `FMUL_SSE` is being assigned to a lambda with a different signature. The original function signature in `vector_math_testing.h` was `void FMUL_SSE(const float src[], float scale, int len, float dest[])`, but the rewriter changed it to `void FMUL_SSE(const float src[], float scale, int len, base::span<float> dest)`. The lambda expression implicitly deduces its return type based on the expression it returns, and the rewriter modified `FMUL_SSE` to accept a `base::span<float>` instead of `float*`.  The error message indicates that the function pointer type in a function pointer table no longer matches the type of the `FMUL_SSE` function.

## Solution
The rewriter needs to spanify all call sites of a function when the function's signature is changed. Specifically, the rewriter must find all instances where `FMUL_SSE` is used as a function pointer and update the function pointer's type to match the spanified signature.

## Note
The second error is:
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../media/base/vector_math.cc:180:50: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  180 |     _mm_store_ps(base::span<float>(dest).subspan(i).data(),
      |                                                  ^
../../base/numerics/safe_conversions.h:229:15: note: candidate template ignored: constraints not satisfied [with Dst = unsigned long, Src = int, SrcType = UnderlyingType<int>]
  229 | constexpr Dst strict_cast(Src value) {
      |               ^
../../base/numerics/safe_conversions.h:227:7: note: because 'kStaticDstRangeRelationToSrcRange<unsigned long, int> == NumericRangeRepresentation::kContained' evaluated to false
  227 |       kStaticDstRangeRelationToSrcRange<Dst, SrcType> ==
      |       ^
```
This error appears to be a case where the rewriter needs to cast argument to base::span::subspan() to an unsigned value.