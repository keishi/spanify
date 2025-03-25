# Build Failure Analysis: 2025_03_19_patch_1915

## First error

../../media/filters/wsola_internals.cc:433:23: error: no matching function for call to 'DecimatedSearch'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DecimatedSearch` was spanified, but the call site at `media/filters/wsola_internals.cc:433` is passing a raw pointer (`energy_candidate_blocks`) where the size is not available. The compiler is unable to convert a raw pointer to `base::span<const float>`. The rewriter failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to recognize the raw pointer and construct a `base::span` from it at the call site, ensuring the span has a valid size. Since the size cannot be automatically determined, the rewriter should provide a user-fill placeholder.

## Note
The relevant code is in media/filters/.