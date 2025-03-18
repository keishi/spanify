# Build Failure Analysis: 2025_03_15_patch_480

## First error

../../third_party/blink/renderer/platform/transforms/transform_operations_test.cc:121:26: error: no matching function for call to 'to_array'

## Category
Rewriter needs to avoid spanifying functions if it requires C++23 features.

## Reason
The code is using `std::to_array` which is a C++23 feature. The spanify tool should not introduce code changes that require a newer C++ standard than what Chromium supports.
The build log shows the error message that the compiler is unable to find the `std::to_array` function.

## Solution
The rewriter needs to check if the code is using a C++23 feature and prevent spanifying code that requires a newer C++ standard than what Chromium supports.

## Note
There are no extra errors in this build log.