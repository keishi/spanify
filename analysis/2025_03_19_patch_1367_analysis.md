# Build Failure Analysis: 2025_03_19_patch_1367

## First error

../../third_party/blink/renderer/platform/fonts/font.cc:402:23: error: reinterpret_cast from 'Vector<Font::TextIntercept>' to 'SkScalar *' (aka 'float *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified `intercepts`, but left a `reinterpret_cast` that is applied to it. This is no longer valid.

## Solution
The rewriter needs to be able to remove it, similar to how the rewriter handles removing `.data()` on spanified variables.