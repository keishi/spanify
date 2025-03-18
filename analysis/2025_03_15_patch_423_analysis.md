# Build Failure Analysis: 2025_03_15_patch_423

## First error

../../cc/paint/render_surface_filters.cc:168:43: error: member reference base type 'float[20]' is not a structure or union

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `float matrix[20]` to `base::span<float, 20> matrix`, but `CreateMatrixImageFilter` is a third_party function (Skia) and thus requires `.data()` to be called on the span. The rewriter failed to insert `.data()`.

## Solution
The rewriter should recognize this pattern and add `.data()` when passing `base::span` variables to third_party functions like `Skia`.

## Note
Lots of other functions are missing .data() calls.