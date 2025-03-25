# Build Failure Analysis: 2025_03_19_patch_1910

## First error

../../media/filters/wsola_internals.cc:426:3: error: no matching function for call to 'MultiChannelMovingBlockEnergies'
  426 |   MultiChannelMovingBlockEnergies(search_block, target_size,
      |   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/filters/wsola_internals.cc:244:6: note: candidate function not viable: no known conversion from 'pointer' (aka 'float *') to 'base::span<float>' for 3rd argument
  244 | void MultiChannelMovingBlockEnergies(const AudioBus* input,
      |      ^
  245 |                                      int frames_per_block,
  246 |                                      base::span<float> energy) {
      |                                      ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `MultiChannelMovingBlockEnergies` was spanified, but the rewriter failed to update the call site at `media/filters/wsola_internals.cc:426`. The code passes a raw pointer (`float*`) as the `energy` argument.  This indicates a failure to adapt the call site to the spanified signature.

## Solution
The rewriter should wrap the `energy` argument at the call site with `base::span`. The correct usage is `base::span(energy, size)`.  The rewriter needs to be able to determine the correct size for this span, which should be the length of the `energy` buffer.  The current code doesn't track the size information so the size should be injected to a placeholder which the developer can later fill.