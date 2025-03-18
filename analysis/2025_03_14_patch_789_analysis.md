# Build Failure Analysis: 2025_03_14_patch_789

## First error

../../media/gpu/vaapi/test/vp8_decoder.cc:149:17: error: static assertion failed due to requirement 'std::extent<decltype(sgmnt_hdr.lf_update_value)>() == std::extent<decltype(pic_param.loop_filter_level)>()': loop filter level arrays mismatch
  149 |   static_assert(std::extent<decltype(sgmnt_hdr.lf_update_value)>() ==

## Category
Rewriter needs to avoid spanifying fields if it requires spanifying excluded code.

## Reason
The rewriter changed `lf_update_value` from a C-style array to a `std::array`. A static assertion in `vp8_decoder.cc` checks the size of `sgmnt_hdr.lf_update_value` against the size of `pic_param.loop_filter_level`. The rewriter spanified the field in Vp8SegmentationHeader but not in the `VP8Picture` struct because presumably `VP8Picture` code is excluded from rewriting (perhaps generated code) .

## Solution
The rewriter should not have modified `Vp8SegmentationHeader` if it could not also modify `VP8Picture`.

## Note
It's possible that the rewriter could spanify both fields, but the safer approach is to avoid spanifying either field if the other cannot be rewritten.