# Build Failure Analysis: 2025_03_14_patch_1279

## First error

../../ui/gfx/color_space.cc:227:32: error: member reference base type 'float[9]' is not a structure or union
  227 |   memcpy(custom_primary_matrix_.data(), &to_XYZD50, 9 * sizeof(float));
      |          ~~~~~~~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter needs to use .data() on the source argument of memcpy when the destination is not a std::array.

## Reason
The code attempts to call memcpy with `custom_primary_matrix_.data()` as the source, but the destination `to_XYZD50` is a `skcms_Matrix3x3` which is a struct, not a `std::array`. The compiler complains because `.data()` can only be called on objects of class type, like `std::array`. In this case, the rewriter should have added `&` to the source so memcpy would work correctly, i.e. `memcpy(&to_XYZD50, custom_primary_matrix_, ...)` because the destination was not converted to std::array.

## Solution
The rewriter should check if the destination argument of memcpy is of class type. If it is not class type then the source argument should be `custom_primary_matrix_`, and not `custom_primary_matrix_.data()`.

## Note
There are several more similar errors of failing to compile `memcpy` calls for the same reason. The rewriter should also not convert variable to base::span if it is assigned directly to another struct. Also, when passing `custom_primary_matrix_` to reinterpret_cast, it should not be passed as `.data()`.