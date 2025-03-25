# Build Failure Analysis: 2025_03_19_patch_1030

## First error

Overlapping replacements: ./remoting/protocol/auth_util.cc at offset 1239, length 17: "(out_bytes.size() * sizeof(decltype(out_bytes)::value_type))" and offset 1245, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both `.data()` and calculate the size of the array at the same location, resulting in overlapping replacements. The rewriter is likely trying to convert a C-style array to `std::array` and then pass it to a function that expects a pointer and size. The logic for appending `.data()` and rewriting the `sizeof` expression is conflicting.

## Solution
The rewriter should either choose the `.data()` approach or calculate the size and avoid both. It probably should use the `.data()` approach and not calculate the size.

## Note
Many overlapping replacements are present in the source code.