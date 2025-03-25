# Build Failure Analysis: 2025_03_19_patch_834

## First error

Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 6576, length 14: "(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))" and offset 6582, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both the size calculation `(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))` and `.data()` to the same expression, but the `.data()` replacement overlaps with the size calculation. This indicates a conflict in the rewriter logic, where it's trying to rewrite the same region of code in two different ways.

## Solution
The rewriter needs to avoid generating overlapping replacements. This typically requires ensuring that replacements are sorted by their starting offset and that no two replacements overlap. Or that the size computation is done prior to the .data() replacement.

## Note
The error occurs because the rewriter first tries to add the size calculation for the `std::array` then it tries to add the `.data()` method call to the same variable. This results in overlapping replacements. There are three occurrences of the same error in the log.