# Build Failure Analysis: 2025_05_02_patch_1278

## First error
Overlapping replacements: ./base/strings/safe_sprintf_unittest.cc at offset 14743, length 33: ").subspan( sizeof(addr) - strlen(addr) - 1)" and offset 14745, length 12: "(addr.size() * sizeof(decltype(addr)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to make two conflicting changes to the same region of code. The first change comes from attempting to rewrite sizeof(addr) to addr.size() * sizeof(decltype(addr)::value_type). The second change comes from attempting to add .data() to the addr variable.

## Solution
The rewriter needs to avoid overlapping replacements. It may be necessary to reorder the rewrites or to combine them into a single rewrite.

## Note
None