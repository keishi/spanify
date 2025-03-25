# Build Failure Analysis: 2025_03_19_patch_421

## First error

../../cc/tiles/gpu_image_decode_cache_unittest.cc:3784:60: error: member reference base type 'SkISize[4]' is not a structure or union
 3784 |     yuva_pixmap_info.yuvaInfo().planeDimensions(plane_sizes.data());
      |                                                 ~~~~~~~~~~~^~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code was trying to access member `data()` of the spanified array variable `plane_sizes` but the `planeDimensions` function which returns the array value, was spanified but the rewriter failed to add the `.data()` to it. Because of that the type of `plane_sizes.data()` is the same as `plane_sizes` (`SkISize[4]`), which is not an object with member named `data`.

## Solution
Rewriter needs to add `.data()` to spanified return value.

## Note
The rest of the errors stem from the first error, they're all about calling `decode_and_check_plane_sizes` with incorrect parameters. These will be fixed when the first error is fixed.