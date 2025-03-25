# Build Failure Analysis: 2025_03_19_patch_751

## First error
Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 15638, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15644, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the `kIAD` array after it has been converted to `std::array`. At the same time it is trying to calculate the size of the original `kIAD` array with `(kIAD.size() * sizeof(decltype(kIAD)::value_type))`. These two rewrites are overlapping.

## Solution
The rewriter should avoid generating multiple replacements for the same area. In this case, the rewriter should make sure that it doesn't generate size calculation for arrayified variables.

## Note