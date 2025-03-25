```
# Build Failure Analysis: 2025_03_19_patch_1716

## First error

../../content/browser/service_worker/service_worker_consts.h:75:3: error: non-static data member cannot be constexpr; did you intend to make it static?

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter rewrites the constant char array to be std::array, but fails to add the static qualifier. This causes a compilation error because the rewriter is missing static qualifier.

## Solution
Rewriter should insert `static` when it changes a constant array of char type to `std::array`.