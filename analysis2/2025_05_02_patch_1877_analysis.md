# Build Failure Analysis: 2025_05_02_patch_1877

## First error
../../third_party/blink/renderer/platform/graphics/darkmode/darkmode_classifier.cc:1181:3: error: no matching function for call to 'FullyConnected'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FullyConnected` was spanified, but a call site is passing a raw pointer. This means the rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter should spanify the call site as well.

## Note
None