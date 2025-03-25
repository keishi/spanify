# Build Failure Analysis: 2025_03_19_patch_724

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5618, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5624, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to the spanified array, but incorrectly computes the size using `sizeof(buffer)` instead of `.size() * sizeof(decltype(buffer)::value_type))`. This results in overlapping replacements because both changes are applied in the same location.

## Solution
The rewriter logic should be modified to correctly calculate the array size after converting it to `std::array` and then ensure it only adds `.data()` to spanified arrays when they are passed to third party functions. The conflicting size computation replacement should be removed.

## Note
This error indicates a flaw in the rewriter's logic for handling `std::array` variables, leading to overlapping replacements. This is similar to a previous error and requires a more robust solution in the rewriter.