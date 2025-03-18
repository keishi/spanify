# Build Failure Analysis: 2025_03_14_patch_1416

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:279:26: error: no member named 'subspan' in 'std::array<char, 70>'
  279 |     auto* end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                 ~~~~~~~~ ^

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::find.

## Reason
The code uses `std::find` with `kAllowed`, which was converted to `std::array`, but `std::find` expects raw pointer.

## Solution
Rewriter needs to add `.data()` to kAllowed to resolve the type issue.

## Note
None