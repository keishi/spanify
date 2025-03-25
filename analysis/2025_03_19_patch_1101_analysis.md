# Build Failure Analysis: 2025_03_19_patch_1101

## First error

../../third_party/blink/renderer/platform/transforms/transform_operations_test.cc:121:26: error: no matching function for call to 'to_array'

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The code uses `std::to_array` with an initializer list to create a `std::array`. However, the rewriter incorrectly uses `std::to_array` with a lambda which causes a compiler error.

## Solution
The rewriter should avoid using `std::to_array` with a lambda.

## Note
There are no additional errors.