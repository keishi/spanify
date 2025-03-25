# Build Failure Analysis: 2025_03_19_patch_965

## First error

../../media/parsers/vp9_parser.cc:832:11: error: use of undeclared identifier 'ref_slots_'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter incorrectly assumed that `ref_slots_` was an arrayified variable and attempted to add `.data()` to it in `media/parsers/vp9_parser.cc`. However, the variable is already an `std::array`, so there is no need to add `.data()`. It should have added `tmp_context.ref_slots_.size()` in place of `ref_slots_.size()`.

## Solution
Remove the `.data()` call from the `memcpy` in `Vp9Parser::ParseSVCFrame()`. The rewriter should not attempt to add `.data()` to `std::array` objects when they are not the result of spanification.
## Note
The `memset` had a similar issue that was corrected. If the rewriter can detect `memset` and `memcpy` better, then this might not happen.