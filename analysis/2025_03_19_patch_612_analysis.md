# Build Failure Analysis: 2025_03_19_patch_612

## First error

../../third_party/blink/renderer/modules/webaudio/periodic_wave.cc:275:32: error: no matching conversion for functional-style cast from '__m128 *' to 'base::span<__m128, 1>'

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code attempts to create a `base::span` from the address of a `__m128` variable `v_ratio` using `base::span<__m128, 1>(&v_ratio)`. However, the subsequent `reinterpret_cast` to `float*` is invalid because you cannot directly cast from a `base::span<__m128, 1>` to a `float*`.

## Solution
The `reinterpret_cast` defeats the purpose of spanifying the variable in the first place. Instead of using `reinterpret_cast`, copy the data into a `std::array` of floats and create a span on that.

```c++
std::array<float, 4> ratio_data;
static_assert(sizeof(v_ratio) == sizeof(ratio_data));
std::memcpy(ratio_data.data(), &v_ratio, sizeof(v_ratio));
base::span<const float, 4> ratio(ratio_data);
```

## Note
A secondary error occurs due to the `reinterpret_cast` from the span to `float*`. Rewriter should avoid spanifying when reinterpret_cast is used.