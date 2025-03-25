# Build Failure Analysis: 2025_03_19_patch_745

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13464, length 13: "(kIAD3.size() * sizeof(decltype(kIAD3)::value_type))" and offset 13470, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to `kIAD3` and replace `sizeof` with `kIAD3.size() * sizeof(decltype(kIAD3)::value_type)`. The `.data()` replacement is contained within the replacement for the size, which causes an overlapping replacement.

## Solution
The rewriter should be modified to prevent generating overlapping replacements. When converting an array to `std::array`, the rewriter should be smarter about rewrite rules. This can be done by preventing the second replacement when the first replacement includes it.

## Note
The rewriter converted `kIAD3` to std::array. The line `iface1a->alternates[0]->extra_data.assign(kIAD3, kIAD3 + sizeof(kIAD3));` was rewritten as: `iface1a->alternates[0]->extra_data.assign(kIAD3.data(), base::span<const uint8_t>(kIAD3 ).subspan( sizeof).data()(kIAD3));`