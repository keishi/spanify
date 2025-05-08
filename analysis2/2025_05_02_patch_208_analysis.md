# Build Failure Analysis: 2025_05_02_patch_208

## First error

```
../../media/gpu/vaapi/vaapi_wrapper.cc:1082:17: error: static assertion failed due to requirement 'std::extent<std::array<std::vector<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo, std::allocator<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo>>, 5>, 0>() == VaapiWrapper::kCodecModeMax': |supported_profiles_| size is incorrect.
 1082 |   static_assert(std::extent<decltype(supported_profiles_)>() ==
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter dropped mutable qualifier.

## Reason
The diff converted a `std::vector<ProfileInfo> supported_profiles_[VaapiWrapper::kCodecModeMax];` to a `std::array<std::vector<ProfileInfo>, VaapiWrapper::kCodecModeMax> supported_profiles_;`. `std::extent` is failing because it's evaluating to 0. The original code used a C-style array, and `std::extent` on a C-style array gives the size of the array. However, when the rewriter rewrites the array, the rewriter is dropping the array bound.

## Solution
The fix is to ensure that the rewritten code includes the array bounds.

## Note
N/A