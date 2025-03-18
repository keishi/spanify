# Build Failure Analysis: 2025_03_13_patch_1367

## First error

../../media/formats/mp4/box_definitions.cc:311:48: error: invalid operands to binary expression ('std::array<uint8_t, kInitializationVectorSize>' (aka 'array<unsigned char, kInitializationVectorSize>') and 'uint8_t' (aka 'unsigned char'))
  311 |     RCHECK(reader->Read1(initialization_vector + i));
      |                          ~~~~~~~~~~~~~~~~~~~~~ ^ ~

## Category
Rewriter needs to properly handle arrayified variables when calling `memcpy` or other functions.

## Reason
The code attempts to use pointer arithmetic on a `std::array` object, which is not directly supported. The expression `initialization_vector + i` is invalid because `initialization_vector` is now a `std::array`, and the `+` operator between a `std::array` and an integer is not defined in the same way as for C-style arrays. The rewriter failed to account for the change in type from a C-style array to `std::array` when rewriting this line of code. The `Read1` function likely expects a `uint8_t*`, but it is receiving a `std::array`.

## Solution
The rewriter needs to generate the appropriate code to access the underlying data of the `std::array`. Replace `initialization_vector + i` with `&initialization_vector[i]` or `initialization_vector.data() + i` to get a pointer to the i-th element of the array.

## Note
The same error happens in `media/formats/mp4/track_run_iterator.cc` in multiple locations, so this is a systematic issue with how the rewriter handles `std::array` types in existing code.