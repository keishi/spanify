# Build Failure Analysis: 2025_03_19_patch_776

## First error

../../media/base/sinc_resampler.cc:139:22: error: assigning to 'ConvolveProc' (aka 'float (*)(const int, const float *, const float *, const float *, double)') from incompatible type 'float (const int, base::span<const float>, const float *, const float *, double)': type mismatch at 2nd parameter ('const float *' vs 'base::span<const float>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to spanify `SincResampler::Convolve_SSE`, but it is assigning a function with a `base::span` parameter to `convolve_proc_`, which expects a function with a `const float*` parameter.  The function pointer type `ConvolveProc` is declared in the header file, which is typically more exposed. So the rewriter needs to avoid spanifying functions that require spanifying code outside the scope of the patch.

## Solution
The rewriter needs to be updated to not spanify `SincResampler::Convolve_SSE` to prevent assigning a `base::span` to a function pointer expecting a `const float*`.  Specifically, the rewriter needs to avoid spanifying functions if it requires spanifying code that isn't being rewritten in the current patch.

## Note
The build failure includes additional errors:

*   `reinterpret_cast from 'base::span<const float>' to 'uintptr_t' (aka 'unsigned long') is not allowed` This is likely because after spanifying input_ptr, the rewriter failed to update this line. Rewriter needs to avoid using reinterpret_cast on spanified variable.
*   `no matching function for call to 'strict_cast'` This looks like Rewriter needs to cast argument to base::span::subspan() to an unsigned value.
```
../../media/base/sinc_resampler.cc:419:7: error: reinterpret_cast from 'base::span<const float>' to 'uintptr_t' (aka 'unsigned long') is not allowed
  419 |   if (reinterpret_cast<uintptr_t>(input_ptr) & 0x0F) {
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../media/base/sinc_resampler.cc:421:48: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  421 |       m_input = _mm_loadu_ps(input_ptr.subspan(i).data());