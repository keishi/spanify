# Build Failure Analysis: 2025_05_02_patch_1404

## First error

```
../../media/gpu/vaapi/test/h264_decoder.cc:501:20: error: use of undeclared identifier 'ref_pic_marking'
  501 |     static_assert((ref_pic_marking.size() *
      |                    ^~~~~~~~~~~~~~~
```

## Category
Rewriter needs to update the `static_assert` after changing the type of `ref_pic_marking`.

## Reason
The rewriter changed `H264DecRefPicMarking ref_pic_marking[H264SliceHeader::kRefListSize]` to `std::array<H264DecRefPicMarking, H264SliceHeader::kRefListSize> ref_pic_marking`. The original code's `static_assert` was checking the size of the C-style array `slice_hdr->ref_pic_marking` against `curr_picture_->ref_pic_marking`. However, after the change, the `static_assert` now references `ref_pic_marking` *without* qualifying it with `curr_picture_->`. Therefore it cannot find the newly named member. The compiler doesn't know what `ref_pic_marking` is in the `static_assert`.

## Solution
Update the `static_assert` to use `curr_picture_->ref_pic_marking`. The `memcpy` was correctly updated, but the `static_assert` was not.

```diff
--- a/media/gpu/vaapi/test/h264_decoder.cc
+++ b/media/gpu/vaapi/test/h264_decoder.cc
@@ -498,11 +498,13 @@ bool H264Decoder::InitCurrPicture(const H264SliceHeader* slice_hdr) {
   // process after this picture is decoded, store required data for that
   // purpose.
   if (slice_hdr->adaptive_ref_pic_marking_mode_flag) {
-    static_assert(sizeof(curr_picture_->ref_pic_marking) ==
+    static_assert((curr_picture_->ref_pic_marking.size() *
+                   sizeof(decltype(curr_picture_->ref_pic_marking)::value_type)) ==
                       sizeof(slice_hdr->ref_pic_marking),
                   "Array sizes of ref pic marking do not match.");
-    memcpy(curr_picture_->ref_pic_marking, slice_hdr->ref_pic_marking,
-           sizeof(curr_picture_->ref_pic_marking));
+    memcpy(curr_picture_->ref_pic_marking.data(), slice_hdr->ref_pic_marking,
+           (curr_picture_->ref_pic_marking.size() *
+            sizeof(decltype(curr_picture_->ref_pic_marking)::value_type)));
   }
 
   curr_picture_->visible_rect = visible_rect_;