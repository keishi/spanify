# Build Failure Analysis: 2025_03_15_patch_793

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^

## Category
Rewriter needs to support void type when rewriting raw pointer type to base::span.

## Reason
The rewriter is attempting to replace `void*` with `base::span<void>`. However, `base::span<void>` is an invalid type because `void&` is an invalid type. The rewriter doesn't seem to check if the type of the variable is `void*` before rewriting.

## Solution
The rewriter needs to avoid transforming `void*` into `base::span<void>`.
1.  **Check for `void` Type:** Before rewriting, the rewriter should check if the underlying type is `void`.
2.  **Conditional Rewrite:** If the type is `void`, skip the rewrite for this case. Instead, probably assert that any operation done on a `span<void>` results in another `span<void>` so no type rewriting is needed.

## Note
The errors are all related to `void` type being an invalid type for template argument of `base::span`.