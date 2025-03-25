# Build Failure Analysis: 2025_03_19_patch_740

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 9693, length 25: "(kDeviceDescriptor.size() * sizeof(decltype(kDeviceDescriptor)::value_type))" and offset 9699, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to replace `sizeof(kDeviceDescriptor)` with `(kDeviceDescriptor.size() * sizeof(decltype(kDeviceDescriptor)::value_type))` to get the size of the `std::array`. At the same time, since `kDeviceDescriptor` is being used with buffer, the rewriter is also trying to add `.data()` to `kDeviceDescriptor`. Because these replacements overlap, the compilation fails.

## Solution
The rewriter should avoid generating replacements that overlap. In this specific case, the size calculation and the `.data()` conversion are interfering with each other. A possible solution would be to perform the `.data()` conversion first, and then calculate the size on the `.data()` pointer.

## Note
The issue arises when the rewriter tries to rewrite `sizeof(kDeviceDescriptor)` and also append `.data()` to it. It should do either one or the other, but not try to rewrite both.