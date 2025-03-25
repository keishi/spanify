```
# Build Failure Analysis: 2025_03_19_patch_1967

## First error

../../media/gpu/vaapi/vaapi_utils.cc:331:17: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<unsigned char[4], 0>()': loop filter level arrays mismatch

## Category
Rewriter dropped mutable qualifier.

## Reason
The code was trying to compile this assertion:
```c++
static_assert(std::extent<decltype(sgmnt_hdr.lf_update_value)>() ==
                    std::extent<decltype(pic_param->loop_filter_level)>(),
                "loop filter level arrays mismatch");
```
where `sgmnt_hdr.lf_update_value` has type `std::array<int8_t, kMaxMBSegments>` (kMaxMBSegments = 4), and `pic_param->loop_filter_level` has type `unsigned char[4]`.

By changing `int8_t lf_update_value[kMaxMBSegments];` to `std::array<int8_t, kMaxMBSegments> lf_update_value;`, the `mutable` qualifier was dropped.

## Solution
Add the `mutable` keyword back to the definition of the `lf_update_value` field in `Vp8SegmentationHeader`.

```diff
diff --git a/media/parsers/vp8_parser.h b/media/parsers/vp8_parser.h
index 9f936ca8bce64..ba00a3fdd5564 100644
--- a/media/parsers/vp8_parser.h
+++ b/media/parsers/vp8_parser.h
@@ -32,7 +34,7 @@ struct Vp8SegmentationHeader {
   SegmentFeatureMode segment_feature_mode;
 
   int8_t quantizer_update_value[kMaxMBSegments];
-  int8_t lf_update_value[kMaxMBSegments];
+  mutable std::array<int8_t, kMaxMBSegments> lf_update_value;
   static const int kDefaultSegmentProb = 255;
   uint8_t segment_prob[kNumMBFeatureTreeProbs];
 };
```

## Note
No other errors.