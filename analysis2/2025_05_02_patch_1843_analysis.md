# Build Failure Analysis: 2025_05_02_patch_1843

## First error

../../third_party/blink/renderer/platform/fonts/font.cc:381:23: error: reinterpret_cast from 'Vector<Font::TextIntercept>' to 'SkScalar *' (aka 'float *') is not allowed
  381 |                       reinterpret_cast<SkScalar*>(intercepts));
      |                       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter converted `SkScalar* intercepts_buffer` to `base::span<SkScalar> intercepts_buffer`. But left `reinterpret_cast<SkScalar*>(intercepts)` which is now illegal because `intercepts` is a `Vector<Font::TextIntercept>`. The rewriter needs to be able to remove the `reinterpret_cast`.

## Solution
The rewriter needs to be able to remove the `reinterpret_cast` after the variable has been spanified. The logic should be updated to remove the cast.

## Note