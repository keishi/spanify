# Build Failure Analysis: 2025_05_02_patch_846

## First error

../../third_party/blink/renderer/platform/graphics/logging_canvas.cc:574:23: error: member reference base type 'SkScalar[16]' (aka 'float[16]') is not a structure or union
  574 |   matrix.getColMajor(m.data());
      |                      ~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter converted the function parameter `const SkScalar array[]` to `base::span<const SkScalar> array` in the function `ArrayForSkScalars`.
However, in `LoggingCanvas::didSetM44`, the code calls `matrix.getColMajor(m.data())`, where `m` is a `SkScalar[16]`. The rewriter incorrectly added `.data()` to `m` even though `m` was not converted to a span or array.

## Solution
The rewriter should only add `.data()` to variables/members that it actually spanifies or arrayifies. The rewriter should not add `.data()` to unrelated code.

## Note
The second error is similar.
```
../../third_party/blink/renderer/platform/graphics/logging_canvas.cc:582:23: error: member reference base type 'SkScalar[16]' (aka 'float[16]') is not a structure or union
  582 |   matrix.getColMajor(m.data());
      |                      ~^~~~~