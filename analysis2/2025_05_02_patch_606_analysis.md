# Build Failure Analysis: 2025_05_02_patch_606

## First error

../../ui/gfx/geometry/matrix44.h:52:18: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
   52 |       : matrix_{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}} {}
      |                  ^~~~~~~~~~
      |                  {         }

## Category
Rewriter needs to update initializer list when converting C-style arrays to `std::array`.

## Reason
The rewriter changed `double matrix_[4][4]` to `std::array<std::array<double, 4>, 4> matrix_`, but it did not update the initializer list in the constructor. The initializer list `matrix_{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}` is valid for a C-style array, but it is not valid for a `std::array`. The correct initializer list for `std::array` is `matrix_ = {{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}}`.

## Solution
The rewriter needs to update the initializer list when converting a C-style array to a `std::array`.
The rewriter should generate the following code:
```
Matrix44() : matrix_ = {{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}} {}
```

## Note
The other errors are follow-up errors caused by the first error. `LoadDouble4` and `StoreDouble4` expect a `double*`, but they are getting a `std::array<double, 4>`.