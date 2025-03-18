```
# Build Failure Analysis: 2025_03_14_patch_95

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^

## Category
Rewriter needs to avoid spanifying functions that have `void` type.

## Reason
The rewriter tried to spanify the return type of `AlignedAlloc` to `base::span<void>`. This generated an invalid `reference` type in the span class, since it attempted to create a reference to `void`, which is not allowed in C++. The rewriter should have avoided rewriting the function.

## Solution
The rewriter should check that return types are not `void` when spanifying.