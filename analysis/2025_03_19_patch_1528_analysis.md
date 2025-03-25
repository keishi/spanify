# Build Failure Analysis: 2025_03_19_patch_1528

## First error

../../ui/base/accelerators/global_accelerator_listener/global_accelerator_listener_linux.h:61:3: error: non-static data member cannot be constexpr; did you intend to make it static?

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter replaced `static constexpr char kSessionTokenPrefix[] = "chromium_";` with  `constexpr std::array<char, 10> kSessionTokenPrefix{"chromium_"};` The `constexpr` variable must be `static` if defined inside the class.

## Solution
The rewriter must preserve the `static` keyword when it is a `constexpr` class member.

## Note
The second error occurs because .subspan() is being called on `kSessionTokenPrefix.data()`. The `kSessionTokenPrefix` is now an `std::array` so the proper syntax to call `.subspan()` should be on `kSessionTokenPrefix` rather than `kSessionTokenPrefix.data()`. The fix for the first error will not resolve the second error.