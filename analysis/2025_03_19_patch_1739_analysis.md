# Build Failure Analysis: 2025_03_19_patch_1739

## First error

../../components/gcm_driver/crypto/encryption_header_parsers_unittest.cc:79:27: error: no matching function for call to 'to_array'

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code uses `std::to_array` to initialize `expected_results`. However, the inner struct of `ExpectedResults` changed. Previously, it was a plain struct with a raw C-style array. But after the spanification, that became an std::array. `std::to_array`'s parameters were invalid given the initializer list. The build log also shows that `std::to_array` is a third_party function.

## Solution
The rewriter cannot rewrite third-party code. Since this is third party code, it is better to not do spanification on code used as a parameter.

## Note
This error likely indicates a more general issue where the rewriter is not correctly handling the conversion of C-style arrays to `std::array` in initializers when used with `std::to_array` (third party function). The rewriter should either avoid these scenarios, or perform the necessary transformations to maintain code correctness.