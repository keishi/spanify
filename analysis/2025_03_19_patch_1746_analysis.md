# Build Failure Analysis: 2025_03_19_patch_1746

## First error

../../mojo/core/data_pipe_unittest.cc:1902:21: error: no matching function for call to 'WriteAllData'
1902 |         EXPECT_TRUE(WriteAllData(producer_, buffer, size));

## Category
Rewriter needs to add .data() when rewriting a C-style array to std::array in a third_party function call.

## Reason
The error indicates that the function `WriteAllData` is being called with arguments of incorrect types. Specifically, it expects a `const void*` as the second argument, but it's receiving a `std::array<uint8_t, 100>`. This is because the rewriter changed `buffer` from a C-style array to `std::array`, but didn't add `.data()` when `buffer` is passed to `WriteAllData`.

## Solution
The rewriter should recognize when a C-style array has been converted to `std::array` and `.data()` is needed because the function in question is a third_party function. The logic to recognize this case already exists. The rewriter failed to recognize that `WriteAllData` is third_party function.

## Note
The second error is the same as the first error, but for the `ReadAllData` function.