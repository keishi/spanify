# Build Failure Analysis: 2025_03_14_patch_874

## First error

../../media/gpu/vaapi/vaapi_wrapper.cc:1098:17: error: static assertion failed due to requirement 'std::extent<std::array<std::vector<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo, std::allocator<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo>>, 5>, 0>() == VaapiWrapper::kCodecModeMax': |supported_profiles_| size is incorrect.

## Category
Rewriter made incorrect change to static_assert.

## Reason
The rewriter replaced `std::vector<ProfileInfo>` with `std::array<std::vector<ProfileInfo>, VaapiWrapper::kCodecModeMax>`. This change caused the `static_assert` to fail because the `std::extent` check is now incorrect. The extent of a 2D array is not 5, but rather 0.

## Solution
The rewriter should not have replaced `std::vector<ProfileInfo>` with `std::array<std::vector<ProfileInfo>, VaapiWrapper::kCodecModeMax>`. The rewrite rule should have been more specific to only target raw pointers.

## Note
There are no other errors.