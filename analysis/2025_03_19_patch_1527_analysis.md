# Build Failure Analysis: 2025_03_19_patch_1527

## First error

../../media/gpu/h264_decoder.cc:247:20: error: use of undeclared identifier 'ref_pic_marking'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The code changes show an attempt to access the `data()` member of `curr_pic_->ref_pic_marking` and use `ref_pic_marking.size()` in a `static_assert` and `memcpy` call. However, `ref_pic_marking` is now a member of H264Picture class, which is defined in h264_dpb.h. The rewriter incorrectly assumed `slice_hdr->ref_pic_marking` is the same as `curr_pic_->ref_pic_marking` in the H264Decoder::InitCurrPicture method, and tried to use `.data()` on the `slice_hdr->ref_pic_marking` expression, even though slice_hdr is of type H264SliceHeader, and this member is still a C style array.

## Solution
The rewriter should only add `.data()` when the member has been spanified. In this case, only the `H264Picture::ref_pic_marking` was converted to `std::array`, not `H264SliceHeader::ref_pic_marking`. The rewriter needs to ensure that the member it is operating on has actually been converted to std::array. Alternatively, the rewriter could spanify `H264SliceHeader::ref_pic_marking` as well.

## Note
The other errors are a result of the same root cause, which is that slice_hdr->ref_pic_marking has not been converted.