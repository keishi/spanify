# Build Failure Analysis: 2025_03_19_patch_1304

## First error

../../third_party/blink/renderer/modules/webaudio/wave_shaper_handler.cc:355:42: error: no matching conversion for functional-style cast from '__m128i *' to 'base::span<__m128i, 1>'

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified a variable but left a reinterpret_cast that is applied to it. Rewriter needs to be able to remove it.

## Solution
The rewriter needs to remove the reinterpret_cast as the type is already base::span<__m128i, 1>.

## Note
There is another error that stems from the same problem.