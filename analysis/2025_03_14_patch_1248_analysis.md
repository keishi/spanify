# Build Failure Analysis: 2025_03_14_patch_1248

## First error

../../media/parsers/vp9_parser.cc:843:11: error: use of undeclared identifier 'ref_slots_'
  843 |          (ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));

## Category
Rewriter made incorrect replacement after refactoring code to use std::array.

## Reason
The original code used a C-style array. The patch refactors the code to use `std::array`. However the rewriter spanifies `memset(&ref_slots_, 0, sizeof(ref_slots_));` to `memset(&ref_slots_, 0,(ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));`. But since ref_slots_ is now inside the `Context` class, the code should have been: `memset(&Context::ref_slots_, 0,(ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));`. The build system is also not passing the correct C++ version.

## Solution
The rewriter should have detected the variable was converted to std::array and thus use `Context::` instead of `.`. Or it should not have spanified the line at all.

## Note
The other error is just a follow up error due to the first error.