# Build Failure Analysis: 2025_03_14_patch_378

## First error

../../chrome/browser/download/download_target_determiner_unittest.cc:554:36: error: out-of-line definition of 'RunTestCasesWithActiveItem' does not match any declaration in '(anonymous namespace)::DownloadTargetDeterminerTest'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site.

`DownloadTargetDeterminerTest::RunTestCasesWithActiveItem` is defined out-of-line. The rewriter correctly changed the signature in the declaration, but did not change it in the definition, leading to a mismatch.
The call sites in the test file are also failing to compile.

## Solution
The rewriter needs to update the signatures for out-of-line functions.

## Note
The error message is about a mismatch in the declaration, not an incorrect call.
```
../../chrome/browser/download/download_target_determiner_unittest.cc:554:36: error: out-of-line definition of 'RunTestCasesWithActiveItem' does not match any declaration in '(anonymous namespace)::DownloadTargetDeterminerTest'