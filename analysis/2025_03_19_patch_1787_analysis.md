# Build Failure Analysis: 2025_03_19_patch_1787

## First error

../../media/gpu/vaapi/vaapi_wrapper.cc:1096:17: error: static assertion failed due to requirement 'std::extent<std::array<std::vector<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo, std::allocator<media::(anonymous namespace)::VASupportedProfiles::ProfileInfo>>, 5>, 0>() == VaapiWrapper::kCodecModeMax': |supported_profiles_| size is incorrect.

## Category
Rewriter dropped mutable qualifier.

## Reason
The original code used `std::vector` and the rewriter changed it to `std::array`. The code also uses `static_assert` to assert that the size is correct. However, the `std::vector` size can change so `std::extent` will be 0. But `std::array` has a size of 5. The original vector must have used `mutable` qualifier to be able to modify its contents. By converting `std::vector` to `std::array` the rewriter dropped the `mutable` qualifier.

## Solution
Recognize `mutable` keyword and include it if is was in the original code. This likely requires looking at code like this.
```cpp
-  mutable std::vector<ProfileInfo> supported_profiles_[VaapiWrapper::kCodecModeMax];
+  std::array<std::vector<ProfileInfo>, VaapiWrapper::kCodecModeMax>
+      supported_profiles_;
```
and the resulting crash like this
```
../../base/debug/dwarf_line_no.cc:237:45: error: cannot assign to return value because function 'operator[]' returns a const value
237 |           program_info->filename_offsets[0] = program_info->filename_offsets[1];
    |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^
```

## Note
It is important to correctly detect and propagate the `mutable` qualifier when rewriting data structures.