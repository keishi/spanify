# Build Failure Analysis: 2025_05_02_patch_986

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 15638, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15644, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(kIAD)` to `kIAD.size() * sizeof(decltype(kIAD)::value_type))` and also attempts to add `.data()` to the same expression `kIAD`. The replacements overlap causing an error. The rewriter is trying to rewrite `config->extra_data.assign(kIAD, kIAD + sizeof(kIAD));`

## Solution
The rewriter should avoid applying both RewriteArraySizeof and AppendDataCall to the same code range. The correct fix is to only rewrite the `sizeof` expression, and not apply `.data()`.

## Note
None