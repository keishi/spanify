# Build Failure Analysis: 2025_05_02_patch_987

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 16095, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 16101, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(kIAD)` to `(kIAD.size() * sizeof(decltype(kIAD)::value_type))` and also add `.data()` to kIAD. Because `sizeof` is also part of the `.assign` call the two replacements overlap.

## Solution
The rewriter needs to avoid applying both RewriteArraySizeof and AppendDataCall when the `sizeof` expression is part of a larger expression where `.data()` is being added. Ideally, the AppendDataCall rewrite should take precedence, and the RewriteArraySizeof should be suppressed in this case.
## Note