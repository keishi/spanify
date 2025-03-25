# Build Failure Analysis: 2025_03_19_patch_747

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13839, length 13: "(kIAD4.size() * sizeof(decltype(kIAD4)::value_type))" and offset 13845, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite `sizeof(kIAD4)` to `(kIAD4.size() * sizeof(decltype(kIAD4)::value_type))` and add `.data()` at the same time. This is causing overlapping replacements.

## Solution
The rewriter should avoid overlapping replacements when rewriting C-style arrays to `std::array` in cases where both rewriting array size and adding `.data()` are required.

## Note
The overlapping replacement happens in this code:
```c++
iface4->alternates[0]->extra_data.assign(kIAD4.data(), base::span<const uint8_t>(kIAD4 ).subspan( sizeof).data()(kIAD4));
```
The rewriter should correctly rewrite array size and add `.data()` when passing the array to `base::span`.