# Build Failure Analysis: 2025_05_02_patch_1092

## First error

../../ui/gfx/render_text_unittest.cc:1221:30: error: no viable conversion from 'const uint32_t *' (aka 'const unsigned int *') to 'base::span<const uint32_t>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The error message indicates that there is no viable conversion from `const uint32_t*` to `base::span<const uint32_t>`. This happens because the rewriter converted the parameter `buffer` in the `TestRectangleBuffer` constructor to a `base::span`. However, the code uses `bitmap.getPixels()` which returns a raw pointer `const uint32_t*`.  The rewriter should have wrapped `bitmap.getPixels()` with a `base::span` constructor, but it failed to do so.  The span's size is unknown, so the rewriter should be using the two-argument span constructor.

## Solution
The rewriter needs to detect the cases where raw pointers are passed to functions that now accept `base::span` arguments, and generate the appropriate `base::span` constructor to wrap the raw pointer with the size when size is known, otherwise the size can be omitted.

For line 1221, the fix is:
```
   base::span<const uint32_t> buffer = base::span(static_cast<const uint32_t*>(bitmap.getPixels()),kCanvasSize.width() * kCanvasSize.height());
```
For line 7792, the fix is:
```
    base::span<const uint32_t> buffer = base::span(static_cast<const uint32_t*>(bitmap.getPixels()),kCanvasSize.width() * kCanvasSize.height());
```
For line 7858, the fix is:
```
    base::span<const uint32_t> buffer = base::span(static_cast<const uint32_t*>(bitmap.getPixels()),kCanvasSize.width() * kCanvasSize.height());
```

## Note
The code has three instances of this error.