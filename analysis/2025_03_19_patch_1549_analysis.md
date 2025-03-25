# Build Failure Analysis: 2025_03_19_patch_1549

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The code is calling `texture_ids.subspan(array_size)` where `array_size` is an `int`. However the argument needs to be an unsigned value to call `subspan`.

## Solution
Cast the argument `array_size` to an unsigned value. Example: `texture_ids.subspan(static_cast<size_t>(array_size))`