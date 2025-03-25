# Build Failure Analysis: 2025_03_19_patch_749

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13139, length 13: "(kIAD2.size() * sizeof(decltype(kIAD2)::value_type))" and offset 13145, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to replace `sizeof(kIAD2)` with `(kIAD2.size() * sizeof(decltype(kIAD2)::value_type))` and also attempts to insert `.data()` after `kIAD2`.  Because the `sizeof` expression includes `kIAD2`, and the `.data()` insertion also applies to `kIAD2`, the replacements overlap.

## Solution
The rewriter should avoid attempting to insert `.data()` when there are already other replacements pending on the same expression. A more robust solution might involve a more comprehensive conflict detection mechanism or a different approach to generating replacements.

## Note
The diff shows that rewriter converted `kIAD2` to `std::to_array<uint8_t>`. The rewriter generated the code `base::span<const uint8_t>(kIAD2 ).subspan( sizeof).data()(kIAD2)`.