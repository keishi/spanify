# Build Failure Analysis: 2025_05_02_patch_97

## First error

```
../../media/parsers/h265_parser.cc:127:13: error: assigning to 'uint8_t *' (aka 'unsigned char *') from incompatible type 'value_type' (aka 'std::array<unsigned char, 64>')
  127 |       dst = scaling_list_data->scaling_list_16x16[matrix_id];
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter failed to add `.data()` to a spanified member field.

## Reason
The rewriter converted `scaling_list_16x16` from a C-style array to a `std::array`. The code then attempts to assign an element of this `std::array` (which is itself a `std::array<uint8_t, kScalingListSizeId1To3Count>`) to a `uint8_t* dst`.  Since the `scaling_list_16x16` member was spanified, but `.data()` was not added to the access to it, this results in a type mismatch. The rewriter should have added `.data()` to decay the `std::array<uint8_t, kScalingListSizeId1To3Count>` to a `uint8_t*`.

## Solution
The rewriter needs to add `.data()` when assigning the value of a `std::array` to a `uint8_t*`.

## Note
The same error occurs in multiple locations in the code.
```
../../media/parsers/h265_parser.cc:1631:21: error: assigning to 'uint8_t *' (aka 'unsigned char *') from incompatible type 'value_type' (aka 'std::array<unsigned char, 64>')
 1631 |               src = scaling_list_data->scaling_list_16x16[ref_matrix_id];
      |                     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h265_parser.cc:1632:21: error: assigning to 'uint8_t *' (aka 'unsigned char *') from incompatible type 'value_type' (aka 'std::array<unsigned char, 64>')
 1632 |               dst = scaling_list_data->scaling_list_16x16[matrix_id];
      |                     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~