# Build Failure Analysis: 2025_05_02_patch_978

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 9808, length 26: "(kConfig1Descriptor.size() * sizeof(decltype(kConfig1Descriptor)::value_type))" and offset 9814, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements at overlapping locations in the code. First, `RewriteArraySizeof` replaces `sizeof(kConfig1Descriptor)` with `(kConfig1Descriptor.size() * sizeof(decltype(kConfig1Descriptor)::value_type))`. Second, `AppendDataCall` attempts to add `.data()` to `kConfig1Descriptor`. Because these replacements overlap, the rewriter reports an error.

## Solution
The rewriter should be modified to avoid applying both `RewriteArraySizeof` and `AppendDataCall` to the same expression. The rewriter should be smart enough to know that if `RewriteArraySizeof` is applied, there is no need to call `AppendDataCall`.

## Note
N/A