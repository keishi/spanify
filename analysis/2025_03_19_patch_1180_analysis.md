# Build Failure Analysis: 2025_03_19_patch_1180

## First error

../../base/files/file_path.h:180:3: error: non-static data member cannot be constexpr; did you intend to make it static?

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter incorrectly converted a static constexpr `char[]` to a non-static constexpr `std::array`. Because `kSeparators` was being accessed from a constexpr context, it must be static.

## Solution
Ensure that when converting `char[]` to `std::array` in a class, the `static` keyword is also added.

## Note
The other errors are cascading errors.