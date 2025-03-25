# Build Failure Analysis: 2025_03_19_patch_1441

## First error

../../components/viz/test/gl_scaler_test_util.cc:315:38: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<const uint32_t>' (aka 'const span<const unsigned int>')
  315 |     const base::span<const uint32_t> src =
      |                                      ^
  316 |         plane.getAddr32(0, y / row_sampling_ratio);
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified third_party function.

## Reason
The function `SkBitmap::getAddr32` is third party code and returns a raw pointer. The rewriter should have constructed a span from the return value, but it didn't.

## Solution
The rewriter should construct a span around the third party code:
```c++
const base::span<const uint32_t> src =
    base::make_span(plane.getAddr32(0, y / row_sampling_ratio), plane.width());
```

It needs to use `base::make_span` because span constructor is explicit, and size needs to be specified. The number of element in the return value is `plane.width()`.

## Note
It is important to check if the function in question is third party code or system library code. Use the `get_chromium_file` tool to confirm. Code in third_party/ is third party code except for third_party/blink/. For example `SkBitmap::getAddr32()` is a commonly used third_party code.