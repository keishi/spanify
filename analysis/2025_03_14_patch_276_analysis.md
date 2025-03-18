# Build Failure Analysis: 2025_03_14_patch_276

## First error

../../content/browser/media/capture/frame_test_util.cc:146:5: error: no matching function for call to 'StimsToN32Row'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The function `StimsToN32Row` was spanified. However, the call site `StimsToN32Row(stims.data(), bitmap.width(), bgra_out)` was not updated to pass a span.

## Solution
The rewriter needs to update the call site `StimsToN32Row` to pass a span.

```
StimsToN32Row(stims.data(), bitmap.width(), bgra_out);
```

needs to be changed to

```
StimsToN32Row(stims.data(), bitmap.width(), base::span(bgra_out, bitmap.width() * 4));