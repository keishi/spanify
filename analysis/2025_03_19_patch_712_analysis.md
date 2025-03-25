# Build Failure Analysis: 2025_03_19_patch_712

## First error

../../media/parsers/vp9_uncompressed_header_parser.cc:929:11: error: use of undeclared identifier 'mode_deltas'
  929 |          (mode_deltas.size() * sizeof(decltype(mode_deltas)::value_type)));
      |           ^

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter has introduced a reference to `mode_deltas` in `vp9_uncompressed_header_parser.cc` as if it's a local variable. However, the code is accessing the member variable `loop_filter.mode_deltas`. The rewriter failed to properly qualify the variable access after converting it to a `std::array`.

## Solution
The rewriter needs to ensure it's referencing the `mode_deltas` member of the `loop_filter` struct, which should be explicitly qualified with `loop_filter.mode_deltas.data()`.

## Note
The original code was `memset(loop_filter.mode_deltas, 0, sizeof(loop_filter.mode_deltas));`. After spanifying `mode_deltas`, the `sizeof` expression needed to change as well.