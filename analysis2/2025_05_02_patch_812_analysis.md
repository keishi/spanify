# Build Failure Analysis: 2025_05_02_patch_812

## First error

../../media/gpu/vaapi/test/vp8_decoder.cc:167:7: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is changing `ref_frame_delta` from `int8_t ref_frame_delta[kNumBlockContexts]` to `std::array<int8_t, kNumBlockContexts> ref_frame_delta;`. Later in `vp8_decoder.cc`, this member is used in a `static_assert`:

```c++
static_assert(std::extent<decltype(lf_hdr.ref_frame_delta)>() ==
          std::extent<decltype(pic_param.loop_filter_deltas_ref_frame)>(),
      "loop filter deltas arrays size mismatch");
```

`pic_param.loop_filter_deltas_ref_frame` is defined in the `Vp8PictureParamBuffer` struct in `media/vaapi/vp8_picture.h`. Because this file is in `media/vaapi`, the rewriter is not spanifying this code. The rewriter should not spanify the `ref_frame_delta` field in `media/parsers/vp8_parser.h` because it will cause a mismatch in the static assert.

## Solution
The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
There are two static assert failures:
```
../../media/gpu/vaapi/test/vp8_decoder.cc:167:7: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch
../../media/gpu/vaapi/test/vp8_decoder.cc:173:17: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch