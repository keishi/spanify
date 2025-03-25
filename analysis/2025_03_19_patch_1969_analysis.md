# Build Failure Analysis: 2025_03_19_patch_1969

## First error

../../media/gpu/vaapi/vaapi_utils.cc:352:17: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch

## Category
Rewriter needs to account for the size difference between a C-style array and an `std::array` when using `std::extent`.

## Reason
The code attempts to verify the size of two arrays using `std::extent`. However, one array (`lf_hdr.mb_mode_delta`) is now an `std::array`, while the other (`pic_param->loop_filter_deltas_mode`) remains a C-style array, and is declared only as a forward declaration (extern). `std::extent` can only determine the size of an `std::array`, but can not find the size of forward declared C-style array.

## Solution
Use `sizeof` instead of `std::extent` when possible to detect the size of the array. When a size is not known, the rewriter should not attempt to do the rewrite.

## Note
The rewriter incorrectly converted `mb_mode_delta` to a `std::array` while `ref_frame_delta` remained a C-style array, leading to a type mismatch. The patch only converted one member of the struct while it used to work with the previous patch.