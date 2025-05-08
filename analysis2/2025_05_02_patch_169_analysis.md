# Build Failure Analysis: 2025_05_02_patch_169

## First error

```
Overlapping replacements: ./ui/events/velocity_tracker/velocity_tracker.cc at offset 2146, length 28: "std::array<float, kMaxDegree + 1> xcoeff" and offset 2146, length 52: "std::array<float, kMaxDegree + 1> ycoeff"
```

## Category
Overlapping replacements due to multiple variable declaration.

## Reason
The rewriter is attempting to apply two replacements that overlap in the source code. This occurs because the rewriter is trying to rewrite both `xcoeff` and `ycoeff` to `std::array` at the same offset. This commonly happens when multiple variables are declared on the same line.

## Solution
The rewriter needs to handle multiple variable declarations on the same line correctly, likely by adjusting the offsets of subsequent replacements to avoid overlap. One possible solution is to process the replacements in order of their appearance on the line, adjusting the starting offset of subsequent replacements based on the length of the previous replacements. Another solution might be to split the declarations into separate lines before applying the transformations.

## Note
This issue occurs when multiple variables are declared on the same line and the rewriter attempts to modify them simultaneously.