# Build Failure Analysis: 2025_05_02_patch_1001

## First error

../../media/base/vector_math.cc:56:5: error: return type 'void (*)(const float *, float, int, base::span<float>)' must match previous return type 'void (*)(const float *, float, int, float *)' when lambda expression has unspecified explicit return type
   56 |     return FMAC_SSE;
      |     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FMAC_SSE` was spanified, but the function pointer assigned to `vector_math::FMAC` still expects a `float*` as the last argument. The rewriter failed to update the function pointer type to `base::span<float>`.

## Solution
The rewriter should identify function pointers that point to spanified functions and update the function pointer's signature to match the new signature with `base::span`.

The code should be changed to:

```c++
void (*FMAC)(const float src[], float scale, int len, base::span<float> dest) = FMAC_SSE;
```

## Note
The second error is:

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../media/base/vector_math.cc:238:41: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  238 |         base::span<float>(dest).subspan(i).data(),
```

This seems like "Rewriter needs to cast argument to base::span::subspan() to an unsigned value."