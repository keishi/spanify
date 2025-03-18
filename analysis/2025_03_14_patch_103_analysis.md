# Build Failure Analysis: 2025_03_14_patch_103

## First error

../../components/history/core/browser/expire_history_backend_unittest.cc:234:25: error: out-of-line definition of 'AddExampleData' does not match any declaration in 'history::ExpireHistoryTest'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The patch spanified the function `ExpireHistoryTest::AddExampleData` in the source file `expire_history_backend_unittest.cc`. The function definition does not match the function declaration in the header file because the header file was not rewritten. The rewriter should not rewrite code that requires it to rewrite outside of chromium/src. This can happen when the span tool tries to rewrite function parameters.

## Solution
The rewriter needs to avoid spanifying functions if it requires spanifying excluded code. This pattern has already been identified.

## Note
NA