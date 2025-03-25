# Build Failure Analysis: 2025_03_19_patch_1973

## First error

../../components/history/core/browser/expire_history_backend_unittest.cc:234:25: error: out-of-line definition of 'AddExampleData' does not match any declaration in 'history::ExpireHistoryTest'

## Category
Pointer passed into spanified function parameter.

## Reason
The patch spanified the function `ExpireHistoryTest::AddExampleData`, but only spanified the definition, not the declaration. Therefore the declaration and definition did not match.

## Solution
The rewriter needs to spanify both the declaration and definition of a function at the same time.

## Note
There was one error.