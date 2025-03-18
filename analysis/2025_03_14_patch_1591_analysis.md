# Build Failure Analysis: 2025_03_14_patch_1591

## First error

../../cc/tiles/gpu_image_decode_cache_unittest.cc:3784:60: error: member reference base type 'SkISize[4]' is not a structure or union
 3784 |     yuva_pixmap_info.yuvaInfo().planeDimensions(plane_sizes.data());
      |                                                 ~~~~~~~~~~~^~~~~

## Category
Rewriter needs to spanify a function, but failed to spanify a call site.

## Reason
The rewriter changed the function signature of `VerifyUploadedPlaneSizes` to take a `base::span<const SkISize, SkYUVAInfo::kMaxPlanes>` as an argument. However, the call site `VerifyUploadedPlaneSizes(cache, draw_image, transfer_cache_entry_id, plane_sizes)` was not updated to construct a span from the `plane_sizes` array. Instead, the code now incorrectly tries to access `.data()` on the array `plane_sizes` directly in function  `yuva_pixmap_info.yuvaInfo().planeDimensions`.

## Solution
The rewriter needs to update call sites to construct a `base::span` when calling a spanified function. In the problematic cases, the call should be rewritten to: `VerifyUploadedPlaneSizes(cache, draw_image, transfer_cache_entry_id, base::span(plane_sizes))`.

## Note
Multiple instances of the same error are observed. Also, similar issues were observed with a lambda capture later in the build log.
```
../../cc/tiles/gpu_image_decode_cache_unittest.cc:4118:3: error: no matching function for call to object of type '(lambda at ../../cc/tiles/gpu_image_decode_cache_unittest.cc:4052:7)'
 4118 |   decode_and_check_plane_sizes(less_than_half_scale, mipped_plane_sizes);
      |   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../cc/tiles/gpu_image_decode_cache_unittest.cc:4052:7: note: candidate function not viable: no known conversion from 'SkISize[3]' to 'base::span<const SkISize, SkYUVAInfo::kMaxPlanes>' for 2nd argument
 4052 |       [this, cache = owned_cache.get(), client_id = owned_cache_client_id](
      |       ^
 4053 |           SkSize scaled_size, base::span<const SkISize, SkYUVAInfo::kMaxPlanes>
      |                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 4054 |                                   mipped_plane_sizes) {
      |                                   ~~~~~~~~~~~~~~~~~~