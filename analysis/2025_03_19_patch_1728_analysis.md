# Build Failure Analysis: 2025_03_19_patch_1728

## First error

../../components/viz/service/frame_sinks/video_capture/video_capture_overlay.cc:566:34: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<const uint32_t>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to directly assign a raw pointer (`uint32_t*`) obtained from `scaled_image.getAddr32(0, y)` to a `base::span<const uint32_t>`. The `base::span` constructor does not implicitly convert from a raw pointer without size information, especially when the function it originates from is third party code.

## Solution
The rewriter should be able to recognize when third party code is returning a raw pointer and create a temporary span with specified size. It should modify the code to construct the span from the raw pointer using the known size. In this case, width of the scaled image is available via size_.width(). The rewritten code would be:

```c++
base::span<const uint32_t> src(scaled_image.getAddr32(0, y), size_.width());
```

## Note
The error message indicates that none of the `base::span` constructors are a viable match for the given raw pointer. This is because there is no size information available at the call site.