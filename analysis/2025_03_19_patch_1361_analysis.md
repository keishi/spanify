```
# Build Failure Analysis: 2025_03_19_patch_1361

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:362:38: error: no member named 'subspan' in 'std::array<char, 84>'
  362 |     const auto* const end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                             ~~~~~~~~ ^

## Category
Rewriter needs to properly implement replacements for `std::array` member calls.

## Reason
The code attempts to call `subspan()` on a `std::array`, but `std::array` does not have the `subspan()` method, only `base::span` does. The rewriter replaced `char kAllowed[]` with `std::array<char, 84> kAllowed`, but failed to rewrite member calls accordingly.

## Solution
The rewriter must correctly account for the different interfaces of C-style arrays, `std::array`, and `base::span` when spanifying and rewriting code. Specifically, the tool needs to remove the `.subspan()` call. A better fix would be to rewrite that code to `kAllowed.data() + std::size(kAllowed) - 1`

## Note
None