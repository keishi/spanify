# Build Failure Analysis: 2025_03_19_patch_1358

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:250:26: error: no member named 'subspan' in 'std::array<char, 84>'

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The variable `kAllowed` was converted to `std::array`, but the code uses `.subspan()` on it. The rewriter should have transformed this call to use `.data()`, but failed to.

## Solution
The rewriter needs to apply subspan rewrite to a spanified return value.