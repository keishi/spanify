# Build Failure Analysis: 2025_03_19_patch_792

## First error

../../cc/paint/render_surface_filters.cc:168:43: error: member reference base type 'float[20]' is not a structure or union
  168 |             CreateMatrixImageFilter(matrix.data(), std::move(image_filter));
      |                                     ~~~~~~^~~~~

## Category
Rewriter needs to avoid using .data() on a variable/member it did not spanify/arrayify.

## Reason
The rewriter is adding `.data()` to the `matrix` variable, but in this case `matrix` is already a `base::span<float, 20>`.  Therefore, `.data()` is not needed and is causing a compiler error. The rewriter should only add `.data()` when it converts a C-style array to `std::array`.

## Solution
The rewriter should check if the variable already has `.data()` and avoid adding it again. In this case, the rewriter should not add .data() because matrix is base::span which already contains the data.

## Note
The extra errors are similar to the first error and result from the same root cause.