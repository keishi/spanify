# Build Failure Analysis: 2025_03_14_patch_1244

## First error

../../media/formats/mp4/box_definitions.cc:413:50: error: invalid operands to binary expression ('std::array<uint8_t, kInitializationVectorSize>' (aka 'array<unsigned char, kInitializationVectorSize>') and 'uint8_t' (aka 'unsigned char'))
  413 |         RCHECK(reader->Read1(default_constant_iv + i));
      |                              ~~~~~~~~~~~~~~~~~~~ ^ ~

## Category
Rewriter needs to handle std::array used in pointer arithmetic.

## Reason
The rewriter converted `uint8_t default_constant_iv[kInitializationVectorSize]` to `std::array<uint8_t, kInitializationVectorSize> default_constant_iv`. The expression `default_constant_iv + i` attempts pointer arithmetic on a `std::array`, which is not allowed. Accessing elements in a `std::array` should be done using `.data()` to get a pointer to the underlying array, and then use pointer arithmetic on that pointer.

## Solution
The rewriter should convert pointer arithmetic on `std::array` variables to use `.data()`:
`default_constant_iv + i` -> `default_constant_iv.data() + i`

## Note
The other error in `box_definitions.cc` is the same. Also, the other errors in `track_run_iterator.cc` are related to the change, because the method wants `.data()` to work.
```
../../media/formats/mp4/track_run_iterator.cc:520:31: error: invalid conversion from 'const value_type* {aka const unsigned char*}' to 'uint8_t*' {aka 'unsigned char*'} [-fpermissive]
  520 |             memcpy(entry.initialization_vector, constant_iv, constant_iv_size);
      |             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~
../../media/formats/mp4/track_run_iterator.cc:832:37: error: invalid conversion from 'const value_type* {aka const unsigned char*}' to 'void*' [-fpermissive]
  832 |   memcpy(entry->initialization_vector, constant_iv, kInitializationVectorSize);
      |   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~