# Build Failure Analysis: 2025_05_02_patch_360

## First error

member reference base type 'const float[7]' is not a structure or union

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `transfer_params_` even though it was not rewritten to use span or std::array.

## Solution
The rewriter should only add `.data()` to variables/members that it has rewritten to use span or std::array.