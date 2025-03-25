# Build Failure Analysis: 2025_03_19_patch_835

## First error

Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 6469, length 14: "(kNALU1.size() * sizeof(decltype(kNALU1)::value_type))" and offset 6475, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both size information for the `std::array` and the `.data()` call, but the replacements overlap. This is likely because it is trying to add the `.data()` call to an expression that also needs the `size()` information.

## Solution
The rewriter should ensure that when converting a C-style array to `std::array`, it correctly handles adding `.data()` to the array when it is passed to a function. The rewriter also needs to be careful to ensure that replacements do not overlap. The rewriter should be changed so that the `.data()` call is added *after* adding the size info. Or the rewriter should combine these two into one replacement.

## Note
The log shows this error occurring multiple times in the same file. This is likely due to the same bug happening in multiple locations.