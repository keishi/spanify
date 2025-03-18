# Build Failure Analysis: 2025_03_16_patch_2008

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/services/device/usb/usb_descriptors_unittest.cc at offset 9693, length 25: "(kDeviceDescriptor.size() * sizeof(decltype(kDeviceDescriptor)::value_type))" and offset 9699, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the array `kDeviceDescriptor`, while also trying to rewrite the `sizeof` expression used to calculate the array size.  The `.data()` call's insertion point overlaps with the start of the rewritten `sizeof` expression, causing a conflict.

## Solution
The rewriter needs to avoid applying both the RewriteArraySizeof and AppendDataCall transformations when they would result in overlapping replacements.  This can be done by checking if both transformations would apply to the same expression and skipping one of them (prioritizing one over the other).

## Note
The errors are caused by the rewriter attempting to rewrite both the `sizeof` operator and the array variable.