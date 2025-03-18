```
# Build Failure Analysis: 2025_03_14_patch_66

## First error

../../media/gpu/vaapi/vaapi_utils.cc:349:7: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch
  349 |       std::extent<decltype(lf_hdr.ref_frame_delta)>() ==
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to correctly handle accessing std::array member with std::extent.

## Reason
The code attempts to use `std::extent` on `lf_hdr.ref_frame_delta`, which is now a `std::array`. `std::extent` with rank > 0 can only be used with built-in arrays. Thus, the rewriter generated incorrect code after converting `ref_frame_delta` from a C-style array to `std::array`.

## Solution
The rewriter needs to recognize that the variable in question is a `std::array` and adapt the code accordingly. To get the size of a `std::array`, use `.size()` method instead of `std::extent`

## Note
The test also fails here:

../../media/gpu/vaapi/vaapi_utils.cc:355:17: error: static assertion failed due to requirement 'std::extent<std::array<signed char, 4>, 0>() == std::extent<signed char[4], 0>()': loop filter deltas arrays size mismatch
  355 |   static_assert(std::extent<decltype(lf_hdr.ref_frame_delta)>() ==
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~