# Build Failure Analysis: 2025_05_02_patch_982

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13464, length 13: "(kIAD3.size() * sizeof(decltype(kIAD3)::value_type))" and offset 13470, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements to the same area of code. One replacement is adding ".data()" to the `kIAD3` variable and the other replacement is attempting to rewrite `sizeof(kIAD3)` to `(kIAD3.size() * sizeof(decltype(kIAD3)::value_type))`. These replacements overlap, causing the error.

## Solution
The rewriter should avoid trying to rewrite sizeof when the array is being converted to span.

## Note
The overlapping replacement is happening because the code is trying to assign the data to `iface1a->alternates[0]->extra_data` using `.assign`, but also wants to convert kIAD3 to `base::span`.