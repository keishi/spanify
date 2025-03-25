# Build Failure Analysis: 2025_03_19_patch_1354

## First error

../../media/gpu/vaapi/test/h264_decoder.cc:501:20: error: use of undeclared identifier 'ref_pic_marking'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is trying to access the .data() member on `slice_hdr->ref_pic_marking` but this is not a std::array or span. This field is copied using `memcpy` from `slice_hdr->ref_pic_marking`.

## Solution
The rewriter should not add .data() to a variable/member it did not spanify/arrayify. This seems to be a bug with the rewriter where it added `.data()` to the spanified return value.