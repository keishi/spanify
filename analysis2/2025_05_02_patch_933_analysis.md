# Build Failure Analysis: 2025_05_02_patch_933

## First error

../../media/parsers/vp9_uncompressed_header_parser.cc:599:7: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `mv_fr_probs` which converted it to `std::array`, but the code in `vp9_uncompressed_header_parser.cc` uses `Vp9FrameContext` and initializes `mv_fr_probs` as a C style array in line 599.

## Solution
The rewriter should only modify code that uses variables and members that are being rewritten by the rewriter.

## Note
There is an additional "excess elements in struct initializer" error, which could be related.