# Build Failure Analysis: 2025_03_19_patch_1159

## First error

../../chrome/browser/apps/icon_standardizer.cc:114:31: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<const SkColor>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to initialize a `base::span<const SkColor>` from a raw `SkColor*` pointer. The error message indicates that there's no viable conversion between the two. The rewriter failed to realize that `bitmap.getAddr32` is a third_party function and that it's size information is unavailable.

## Solution
The rewriter needs to wrap the pointer with `base::make_span` to explicitly create a span from the raw pointer and size, however the size is not available, so there is nothing the rewriter can do.

## Note
This error happens because the rewriter doesn't know the size of the buffer pointed to by the raw pointer `bitmap.getAddr32(0, y)`.