# Build Failure Analysis: 2025_05_02_patch_262

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:342:26: error: no member named 'subspan' in 'std::array<char, 70>'
  342 |     auto* end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                 ~~~~~~~~ ^

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter changed `kAllowed` to `std::array`, but then it used `.subspan()` on it, which is incorrect. `std::array` does not have `subspan()` method.

## Solution
The rewriter should not add `.subspan()` to code that has not been spanified.

## Note