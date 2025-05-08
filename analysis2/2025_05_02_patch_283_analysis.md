# Build Failure Analysis: 2025_05_02_patch_283

## First error

Overlapping replacements: ./mojo/public/cpp/bindings/lib/bindings_internal.h at offset 2529, length 3: ".subspan( *)" and offset 2531, length 1: " "

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter is attempting to apply overlapping replacements in the `DecodePointer` function. The first replacement, likely related to `.subspan()`, affects a range that overlaps with a subsequent replacement, which seems to be inserting a space " ".

## Solution
Investigate the logic that generates the replacements for `.subspan()` and space insertion in the `DecodePointer` function. Ensure that the generated replacements do not overlap. The overlapping replacement suggests a conflict in how the rewriter is handling the span conversion and potentially dealing with existing spaces or other characters in that area of the code.