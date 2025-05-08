# Build Failure Analysis: 2025_05_02_patch_852

## First error

../../media/parsers/vp9_uncompressed_header_parser.cc:929:11: error: use of undeclared identifier 'mode_deltas'
  929 |          (mode_deltas.size() * sizeof(decltype(mode_deltas)::value_type)));
      |           ^~~~~~~~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The code was attempting to use `mode_deltas` without specifying that it's a member of the `loop_filter` object. However, `mode_deltas` was already arrayified, so adding `.data()` is incorrect. The correct code should be `loop_filter.mode_deltas.size()` and `decltype(loop_filter.mode_deltas)::value_type`.

## Solution
The rewriter should avoid adding `.data()` to a member/variable it did not spanify/arrayify. This should not have been touched by the rewriter.