```
# Build Failure Analysis: 2025_03_19_patch_1336

## First error

../../ui/native_theme/native_theme_base.cc:384:16: error: member reference base type 'SkScalar[3]' (aka 'float[3]') is not a structure or union
  384 |       track_hsv.data());
      |       ~~~~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter incorrectly added `.data()` to `track_hsv`, which is a C-style array (`SkScalar track_hsv[3];`). It was not spanified/arrayified.

## Solution
The rewriter should not add `.data()` to variables that were not rewritten by the spanification process. Also, the rewriter should be able to determine if the code was already converted or not before doing the rewrite.