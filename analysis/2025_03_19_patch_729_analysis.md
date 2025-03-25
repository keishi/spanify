# Build Failure Analysis: 2025_03_19_patch_729

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 7308, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 7314, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both the `size()` of the array and the `.data()` to the `buffer` variable which is causing an overlapping replacement. This happens when rewriting `std::to_array` and `char[]` to `std::array`. The `RewriteArraySizeof` ASTMatcher adds `size()` and the `AppendDataCall` ASTMatcher adds `.data()`. Because these replacements overlap, the rewriter aborts.

## Solution
The fix is to ensure that RewriteArraySizeof and AppendDataCall do not overlap in `std::to_array` and `char[]` to `std::array` cases.

## Note
No other errors found.