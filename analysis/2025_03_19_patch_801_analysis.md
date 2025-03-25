# Build Failure Analysis: 2025_03_19_patch_801

## First error

../../third_party/blink/renderer/platform/audio/sinc_resampler.cc:352:38: error: no matching conversion for functional-style cast from '__m128 *' to 'base::span<__m128, 1>'

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter is generating code that attempts to create a `base::span` from the address of a `__m128` variable using a functional-style cast. It then uses reinterpret_cast on that span. This is causing a compile error because there is no implicit conversion from `__m128*` to `base::span<__m128, 1>`. Furthermore, reinterpret_cast should not be applied to spanified variables.

## Solution
The rewriter needs to avoid generating the reinterpret_cast, and instead generate the span from `sums1` directly. If reinterpret_cast is necessary, it needs to be done *after* the span has been constructed, not before. In this case, since what's needed is actually a float pointer, this is a special case where we should emit a `.data()` at the end, since base::span<__m128, 1> is convertible to `__m128*`.

```c++
-        float* group_sum_p = reinterpret_cast<float*>(base::span<__m128, 1>(&sums1));
+        float* group_sum_p = reinterpret_cast<float*>(base::span<__m128, 1>(&sums1)).data();
```

## Note
The second error on line 355 is the same as the first.
```
../../third_party/blink/renderer/platform/audio/sinc_resampler.cc:355:48: error: no matching conversion for functional-style cast from '__m128 *' to 'base::span<__m128, 1>'