# Build Failure Analysis: 2025_05_02_patch_981

## First error
Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 13026, length 13: "(kIAD1.size() * sizeof(decltype(kIAD1)::value_type))" and offset 13032, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to both replace `sizeof(kIAD1)` with `(kIAD1.size() * sizeof(decltype(kIAD1)::value_type))` and append `.data()` to `kIAD1`. Because the `.data()` replacement point is within the range of the `sizeof` replacement, this causes a conflict and the build fails.

## Solution
The rewriter should avoid overlapping replacements. This can be achieved by ensuring that the ranges of replacements do not intersect. In this specific scenario, it might be necessary to apply the `.data()` replacement first, and then calculate the `sizeof` replacement based on the adjusted range.

## Note
The diff shows that `kIAD1` is being converted to `std::array`. The `config->extra_data.assign` is then being modified. The rewriter tries to add `.data()` to `kIAD1` and convert the `sizeof` expression, resulting in overlapping replacements.