# Build Failure Analysis: 2025_05_02_patch_95

## First error

../../media/parsers/h265_parser.cc:124:13: error: assigning to 'uint8_t *' (aka 'unsigned char *') from incompatible type 'value_type' (aka 'std::array<unsigned char, 64>')
  124 |       dst = scaling_list_data->scaling_list_8x8[matrix_id];
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to assign `scaling_list_data->scaling_list_8x8[matrix_id]` to a `uint8_t*` (dst). The rewriter changed `scaling_list_8x8` to `std::array`, but failed to update the assignment to use `.data()` to get a raw pointer. The compiler now sees an attempt to assign a `std::array` to a `uint8_t*`, hence the type mismatch error.

## Solution
The rewriter needs to recognize the case where a spanified/arrayified member is assigned to a raw pointer and automatically add `.data()` to the expression.
```
dst = scaling_list_data->scaling_list_8x8[matrix_id].data();