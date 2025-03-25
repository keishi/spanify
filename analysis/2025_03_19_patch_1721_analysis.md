# Build Failure Analysis: 2025_03_19_patch_1721

## First error

../../media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc:262:18: error: cannot increment value of type 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter converted `uint8_t* dst_seg_map` to `base::span<uint8_t> dst_seg_map`, but forgot to change the `*dst_seg_map = most_freq;` line, where it attempts to increment the span.

## Solution
Change `*dst_seg_map = most_freq;` to `dst_seg_map[0] = most_freq;`. No need to do `dst_seg_map++`.

```
       *dst_seg_map = most_freq;
+      dst_seg_map[0] = most_freq;