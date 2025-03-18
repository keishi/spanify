# Build Failure Analysis: 2025_03_14_patch_1343

## First error

../../gpu/vulkan/vulkan_surface.cc:150:30: error: no viable conversion from 'const VkFormat *' to 'base::span<const VkFormat>' (aka 'span<const VkFormat>')

## Category
Rewriter needs to add .data() when converting a C-style array to base::span.

## Reason
The code is trying to initialize a `base::span` with a raw pointer `kPreferredVkFormats32` or `kPreferredVkFormats16`. These are likely C-style arrays (or pointers to the first element of a C-style array). `base::span` can be constructed from C++ arrays, but not directly from raw pointers. The rewriter should add `.data()` to the raw pointer to make it compatible with `base::span`.

## Solution
The rewriter should recognize this pattern and add `.data()` to the raw pointer when initializing `base::span`. The corrected code would be:

```c++
  base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)
                                                     ? kPreferredVkFormats32.data()
                                                     : kPreferredVkFormats16.data();
```

The rewriter needs to match the case where a `base::span` is initialized using a ternary operator that returns a raw pointer.

## Note
The error message says `no viable conversion from 'const VkFormat *' to 'base::span<const VkFormat>'`. This indicates the type mismatch is indeed the cause of the error.
```cpp
../../gpu/vulkan/vulkan_surface.cc:150:30: error: no viable conversion from 'const VkFormat *' to 'base::span<const VkFormat>' (aka 'span<const VkFormat>')
  150 |   base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)