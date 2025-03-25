# Build Failure Analysis: 2025_03_19_patch_289

## First error

Overlapping replacements: ./ui/events/velocity_tracker/velocity_tracker.cc at offset 2084, length 28: "std::array<float, kMaxDegree + 1> xcoeff" and offset 2084, length 52: "std::array<float, kMaxDegree + 1> ycoeff"

## Category
Overlapping replacements due to multiple variable declaration.

## Reason
The rewriter is attempting to replace both `xcoeff` and `ycoeff` with `std::array<float, kMaxDegree + 1>`, but the replacements overlap because they start at the same offset. This is likely due to a bug in the rewriter's logic for handling multiple variable declarations on the same line or adjacent lines without proper offset adjustments.

## Solution
The rewriter needs to be updated to correctly handle multiple variable declarations, likely by adjusting offsets after performing a replacement to prevent overlapping edits. This might involve tracking the length of the replaced text and incrementing the offset for subsequent replacements.

## Note
The diff reveals both `xcoeff` and `ycoeff` inside the `Estimator` struct were supposed to be rewritten.