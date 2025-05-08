# Build Failure Analysis: 2025_05_02_patch_98

## First error

../../media/parsers/h265_parser.cc:130:13: error: assigning to 'uint8_t *' (aka 'unsigned char *') from incompatible type 'value_type' (aka 'std::array<unsigned char, 64>')
  130 |       dst = scaling_list_data->scaling_list_32x32[matrix_id];
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified variable used with a raw pointer.

## Reason
The rewriter converted `scaling_list_32x32` from a C-style array to a `std::array`. However, the code assigns elements of `scaling_list_32x32` to a `uint8_t *` (raw pointer). Since `scaling_list_32x32` is now a `std::array`, accessing an element (e.g., `scaling_list_32x32[matrix_id]`) returns a `std::array`, not a `uint8_t *`. The rewriter needs to add `.data()` to get a raw pointer to the underlying data of the `std::array`.

## Solution
The rewriter should detect when an element of a `std::array` is being assigned to a raw pointer and automatically add `.data()` to the `std::array` element. The corrected line should read:

```c++
dst = scaling_list_data->scaling_list_32x32[matrix_id].data();
```

## Note
The same error occurs multiple times in the file.