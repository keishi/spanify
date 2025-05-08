# Build Failure Analysis: 2025_05_02_patch_1800

## First error

../../third_party/blink/renderer/platform/audio/sinc_resampler.cc:352:13: error: reinterpret_cast from 'base::span<__m128, 1>' to 'float *' is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has created a `base::span` but then used `reinterpret_cast` to convert it to a `float*`. This is not allowed. The error message says `reinterpret_cast from 'base::span<__m128, 1>' to 'float *' is not allowed`.

## Solution
The rewriter should use `.data()` to get a pointer from the `base::span` before using `reinterpret_cast`, like this: `reinterpret_cast<float*>(base::span<__m128, 1>(&sums1, 1u).data())`.

## Note
The same error occurs twice in the log.