# Build Failure Analysis: 2025_05_02_patch_173

## First error

Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 6469, length 14: "(kNALU1.size() * sizeof(decltype(kNALU1)::value_type))" and offset 6475, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to kNALU1 at the same time it's trying to rewrite `sizeof(kNALU1)` to `kNALU1.size() * sizeof(decltype(kNALU1)::value_type)`. This results in overlapping replacements because the `.data()` insertion point falls within the range of the `sizeof` expression.

## Solution
The rewriter needs to avoid applying both RewriteArraySizeof and AppendDataCall in the same line.

## Note
This error occurs multiple times in the file, indicating a systemic issue in the rewriter's logic.