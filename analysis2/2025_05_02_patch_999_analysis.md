# Build Failure Analysis: 2025_05_02_patch_999

## First error

```
../../media/base/vector_math_perftest.cc:249:3: error: no matching member function for call to 'RunBenchmark'
  249 |   RunBenchmark(vector_math::EWMAAndMaxPower_C, kVectorSize,
      |   ^~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:90:8: note: candidate function not viable: no known conversion from 'std::pair<float, float> (float, base::span<const float>, int, float)' to 'std::pair<float, float> (*)(float, const float *, int, float)' for 1st argument
   90 |   void RunBenchmark(
      |        ^
   91 |       std::pair<float, float> (*fn)(float, const float[], int, float),
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `vector_math::EWMAAndMaxPower_C`, but failed to spanify the call site in `vector_math_perftest.cc`. The `RunBenchmark` function expects a function pointer that takes a `const float[]` as an argument, but `vector_math::EWMAAndMaxPower_C` now takes a `base::span<const float>` argument.

## Solution
The rewriter needs to spanify the call site of `vector_math::EWMAAndMaxPower_C` in `vector_math_perftest.cc`. This likely involves changing the signature of the `RunBenchmark` function to accept a function pointer that takes a `base::span<const float>` argument.

```cpp
void RunBenchmark(
    std::pair<float, float> (*fn)(float, base::span<const float>, int, float),
    int len,
    float initial_value,
    float smoothing_factor,
    std::vector<float>& data) {
  base::ScopedAllowBaseSyncPrimitivesForTesting allow_wait;

  for (int i = 0; i < 100000; ++i) {
    fn(initial_value, data, len, smoothing_factor);
  }
}

```
Or changing the callsite to cast the data pointer into a span.
```cpp
   RunBenchmark([](float initial_value, const float* data, int len, float smoothing_factor) {
        return vector_math::EWMAAndMaxPower_C(initial_value, base::span<const float>(data, len), len, smoothing_factor);
      }, kVectorSize,
       initial_value_, smoothing_factor_, data_);