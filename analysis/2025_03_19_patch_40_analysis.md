# Build Failure Analysis: 2025_03_19_patch_40

## First error

../../ui/gfx/color_space.cc:227:32: error: member reference base type 'float[9]' is not a structure or union
  227 |   memcpy(custom_primary_matrix_.data(), &to_XYZD50, 9 * sizeof(float));
      |          ~~~~~~~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is adding `.data()` to `custom_primary_matrix_` which is a `float[9]`. The rewriter logic incorrectly assumed that `custom_primary_matrix_` was converted to a span or array type, and tried to add `.data()` to access the underlying pointer, but it is already an array.

## Solution
The rewriter should only add .data() to spanified or arrayified variables. It should not add it to unrelated code. The rewriter needs to check if `custom_primary_matrix_` is spanified or arrayified before adding `.data()`.

## Note
Several other errors show up because of the incorrect `.data()` insertion.