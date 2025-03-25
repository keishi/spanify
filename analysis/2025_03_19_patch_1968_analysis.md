# Build Failure Analysis: 2025_03_19_patch_1968

## First error

../../media/gpu/vaapi/vp8_vaapi_video_encoder_delegate.cc:657:21: error: static assertion failed due to requirement 'std::extent<signed char[4], 0>() == std::extent<std::array<signed char, 4>, 0>()': Invalid loop filter array sizes

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `int8_t ref_frame_delta[kNumBlockContexts]` to `std::array<int8_t, kNumBlockContexts> ref_frame_delta;` in `media/parsers/vp8_parser.h`. However, the code at `media/gpu/vaapi/vp8_vaapi_video_encoder_delegate.cc` contains a static assertion that checks `std::extent` of these variables. The `std::extent<T>` returns `0` for `T` that is `std::array`, which caused the static assertion to fail. This is because the code wasn't updated to account for the change to std::array. The rewriter failed to recognize a third_party code function call.

## Solution
The rewriter needs to be able to add `.data()` to arrayified variable used with a third_party function call.

## Note
The error occurs within a static_assert, which compares the extents of `pic_param.ref_lf_delta` and `frame_header->loopfilter_hdr.ref_frame_delta`. The spanified field is `frame_header->loopfilter_hdr.ref_frame_delta`. The code at `media/gpu/vaapi/vp8_vaapi_video_encoder_delegate.cc` would need an appropriate fix to accommodate the new `std::array` data structure, such as using .data() when referring to the array's data pointer.