# Build Failure Analysis: 2025_03_19_patch_150

## First error

../../media/formats/mp4/box_definitions.cc:413:50: error: invalid operands to binary expression ('std::array<uint8_t, kInitializationVectorSize>' (aka 'array<unsigned char, kInitializationVectorSize>') and 'uint8_t' (aka 'unsigned char'))

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code `default_constant_iv + i` is attempting pointer arithmetic on `default_constant_iv`, which is now an `std::array`. However, `operator+` is not directly defined between `std::array` and an integer. The correct way to access elements within the array is to use `.data() + i` to get a pointer to the underlying data and then perform the pointer arithmetic.

## Solution
Modify the code generation to use `.data()` when performing pointer arithmetic on `std::array` objects. The correct expression would be `default_constant_iv.data() + i`.

## Note
The same error occurs again at line 2320.