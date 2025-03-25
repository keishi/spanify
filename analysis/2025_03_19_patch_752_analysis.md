# Build Failure Analysis: 2025_03_19_patch_752

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 16095, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 16101, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite both the size calculation of the array and append `.data()` to the array when assigning it to `extra_data`, resulting in overlapping replacements. This is because `kIAD` is being converted to `std::array`.

## Solution
The rewriter needs to avoid performing both the RewriteArraySizeof and AppendDataCall rewrites on the same C-style array variable when that variable is also converted to a `std::array`.  It should prioritize either the conversion or the existing size calculation + .data() append and avoid doing both.  A better approach is to calculate the size using `.size()` after it is converted to `std::array`.

## Note
The error log shows overlapping replacements, indicating a conflict between the rewriter components. This means the `RewriteArraySizeof` transformation generates code to compute the size of the C-style array using `kIAD.size() * sizeof(decltype(kIAD)::value_type)` while at the same time `AppendDataCall` tries to add `.data()` when assigning kIAD to config->extra_data. The overlapping replacement error shows that these replacements are trying to modify the same region of the source code, which is impossible.