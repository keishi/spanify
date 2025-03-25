# Build Failure Analysis: 2025_03_19_patch_122

## First error

../../net/cert/ct_log_verifier_unittest.cc:626:34: error: no matching function for call to 'HashTree'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `HashTree` was spanified to take a `base::span<std::string>` as input. However, the call site at line 626 is passing `&leaves[split]`, which is a raw pointer `std::string*`. This results in a type mismatch, as there is no implicit conversion from `std::string*` to `base::span<std::string>`. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should be updated to correctly handle the case where a raw pointer to the start of a sub-array is passed to a function expecting a `base::span`. It should recognize that it cannot get the size of this span, and generate a compile error instead.

## Note
Several other errors in the build log share the same root cause, all stemming from passing a raw pointer to a function expecting `base::span`.