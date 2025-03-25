# Build Failure Analysis: 2025_03_19_patch_1974

## First error

../../components/history/core/browser/expire_history_backend_unittest.cc:236:25: error: out-of-line definition of 'AddExampleData' does not match any declaration in 'history::ExpireHistoryTest'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The original function `AddExampleData` was declared with a C-style array `URLID url_ids[3]`. The rewriter correctly changed the function definition to use a `base::span<URLID, 3>`. However, it didn't update the call site in `TEST_F(ExpireHistoryTest, DeleteURLs)` which resulted in passing `std::array<URLID, 3>` to a function expecting a `URLID*`.

## Solution
The rewriter needs to spanify the call site in `TEST_F(ExpireHistoryTest, DeleteURLs)`.

## Note
The secondary error is a result of the first error.