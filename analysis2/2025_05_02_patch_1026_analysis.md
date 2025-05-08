# Build Failure Analysis: 2025_05_02_patch_1026

## First error

../../media/filters/wsola_internals.cc:431:3: error: no matching function for call to 'MultiChannelMovingBlockEnergies'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MultiChannelMovingBlockEnergies` was spanified, but the call site at `wsola_internals.cc:431` is still passing a raw pointer (`float*`) as the `energy` argument. The compiler cannot implicitly convert a raw pointer to a `base::span<float>`.

## Solution
The rewriter needs to update the call site to pass a `base::span<float>` instead of a raw pointer.  Since the function `MultiChannelMovingBlockEnergies` expects a `base::span<float>`, the caller should construct a `base::span<float>` from the raw pointer and the size of the buffer.  Since the size of the `energy` buffer in `MultiChannelDotProduct` is implicitly defined based on the `channels` variable, we need to create a span from the energy variable using channels as the size.

```c++
  base::span<float> energy_span(energy, channels);
  MultiChannelMovingBlockEnergies(search_block, target_size, energy_span);
```

## Note
N/A