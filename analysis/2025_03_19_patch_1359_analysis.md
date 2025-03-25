# Build Failure Analysis: 2025_03_19_patch_1359

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:279:26: error: no member named 'subspan' in 'std::array<char, 70>'
  279 |     auto* end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                 ~~~~~~~~ ^

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code attempts to call `subspan` on `kAllowed`, which is a `std::array`, not a `base::span`. However, the intention was to use `subspan` after the rewriter has transformed `kAllowed` to a `base::span`, but the rewriter failed to rewrite that.

## Solution
The rewriter should have rewritten `kAllowed` into a span before calling `subspan`, but it failed to do so. Therefore we need to look at why the variable is not being spanified.

## Note
The initial transformation of the char array to std::array is successful, however `kAllowed` should then be spanified using `base::span`. It is possible that there's a check or something preventing this.