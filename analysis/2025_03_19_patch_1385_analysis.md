```
# Build Failure Analysis: 2025_03_19_patch_1385

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^

## Category
Rewriter needs to avoid spanifying functions returning `void*`.

## Reason
The rewriter blindly converted `void* AlignedAlloc(size_t size, size_t alignment)` to `base::span<void> AlignedAlloc(size_t size, size_t alignment)`. However, `base::span` requires its element type to be referenceable, which `void` is not.

## Solution
Add a check to the rewriter to prevent rewriting function return types to `base::span` when the underlying type is `void`.