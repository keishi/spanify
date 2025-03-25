# Build Failure Analysis: 2025_03_19_patch_1031

## First error

Overlapping replacements: ./mojo/public/cpp/bindings/lib/bindings_internal.h at offset 2638, length 3: ".subspan( *)" and offset 2640, length 1: " "

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter attempts to insert `.data()` calls, but because spanification happens inside `DecodePointer`, the `subspan()` already present conflicts. This happens in `mojo/public/cpp/bindings/lib/bindings_internal.h` where the code is changed to `.subspan( offset[0])` which needs to be `.subspan(offset[0]).data()`.

## Solution
The rewriter needs to take into account the subspan and insert the `.data()` call after that. The rewriter should detect this overlapping replacement and generate a single correct replacement.

## Note
The replacements overlap.