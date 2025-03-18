# Build Failure Analysis: 2025_03_14_patch_607

## First error

../../services/device/usb/webusb_descriptors_unittest.cc:216:36: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 46UL>' (aka 'const array<unsigned char, 46UL>') and 'unsigned long')
  216 |           kExampleUrlDescriptor255 +

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array to `std::array`. However, when passing this `std::array` to a function (in this case, constructing a `std::vector`), the rewriter did not add `.data()` to get a pointer to the underlying data. The `std::vector` constructor expects a pointer, not an `std::array`.

## Solution
The rewriter needs to recognize when a converted `std::array` is being used in a context where a pointer is expected (specifically in the construction of a `std::vector`) and automatically add the `.data()` method call to get the pointer to the underlying data.

## Note
This is a duplicate of the existing category "Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.".