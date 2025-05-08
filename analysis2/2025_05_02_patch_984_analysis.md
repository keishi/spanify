# Build Failure Analysis: 2025_05_02_patch_984

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13139, length 13: "(kIAD2.size() * sizeof(decltype(kIAD2)::value_type))" and offset 13145, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to add both the `.data()` method call and calculate the size of the `kIAD2` array, resulting in overlapping replacements. The size calculation is happening because the rewriter is trying to calculate the size in bytes to call `subspan()` correctly.

## Solution
The rewriter needs to avoid overlapping replacements between RewriteArraySizeof and AppendDataCall.