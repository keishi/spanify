# Build Failure Analysis: 2025_03_19_patch_742

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 9924, length 26: "(kConfig2Descriptor.size() * sizeof(decltype(kConfig2Descriptor)::value_type))" and offset 9930, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to replace `sizeof(kConfig2Descriptor)` with `(kConfig2Descriptor.size() * sizeof(decltype(kConfig2Descriptor)::value_type))`.
At the same time it attempts to add `.data()` to the same variable, so the replacements end up overlapping.

## Solution
The rewriter should be able to recognize this pattern and avoid overlapping replacements.

## Note
This looks like a pretty standard case that we've seen before.