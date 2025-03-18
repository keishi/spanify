# Build Failure Analysis: 2025_03_14_patch_1260

## First error

../../remoting/test/frame_generator_util.cc:68:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to use a constructor with .data() for spanification of raw pointer return values from third_party functions.

## Reason
The code attempts to assign the raw pointer returned by `frame->GetFrameDataAtPos()` to a `base::span<uint32_t>`. The `base::span` class doesn't have an implicit conversion constructor from a raw pointer, so an explicit construction of `base::span` is needed, and the size of the memory region needs to be specified.

## Solution
Modify the code to explicitly construct the `base::span` from the pointer and the known width of the rectangle:

```c++
base::span<uint32_t> data(reinterpret_cast<uint32_t*>(
        frame->GetFrameDataAtPos(webrtc::DesktopVector(rect.left(), y))), rect.width());
```

This explicitly constructs a span that covers the memory region.

## Note
It is crucial to ensure that `rect.width()` accurately reflects the valid size of the memory region pointed to by the pointer returned from `frame->GetFrameDataAtPos()`.