# Build Failure Analysis: 2025_05_02_patch_985

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 15273, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15279, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to `kIAD` but also rewrites `sizeof(kIAD)` to `(kIAD.size() * sizeof(decltype(kIAD)::value_type))`. These replacements overlap, leading to the error. The `AppendDataCall` rewrite is triggered because `config->extra_data.assign` is a third-party function.

## Solution
The rewriter needs to avoid overlapping replacements when rewriting `sizeof` and adding `.data()`. The rewriter should either perform the `sizeof` rewrite after the `.data()` insertion or avoid the `sizeof` rewrite altogether when the variable is passed to a third-party function that will trigger the `.data()` insertion.

## Note
The overlapping replacements are:
```
"(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15279, length 0: ".data()"