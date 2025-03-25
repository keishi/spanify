# Build Failure Analysis: 2025_03_19_patch_1360

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:338:26: error: no member named 'subspan' in 'std::array<char, 70>'

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter converted `constexpr char kAllowed[]` to `constexpr std::array<char, 70> kAllowed`. But there is still `kAllowed.subspan(std::size(kAllowed) - 1)`. It forgot to call `.data()` first.

## Solution
The rewriter should transform `kAllowed.subspan(std::size(kAllowed) - 1)` to `kAllowed.data().subspan(std::size(kAllowed) - 1)`.