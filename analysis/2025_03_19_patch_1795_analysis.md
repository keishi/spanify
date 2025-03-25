# Build Failure Analysis: 2025_03_19_patch_1795

## First error

../../gpu/vulkan/vulkan_surface.cc:150:30: error: no viable conversion from 'const VkFormat *' to 'base::span<const VkFormat>' (aka 'span<const VkFormat>')
  150 |   base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)

## Category
Rewriter needs to construct a span from a C-style array.

## Reason
The code initializes a `base::span<const VkFormat>` with a C-style array (`kPreferredVkFormats32` or `kPreferredVkFormats16`). The compiler cannot implicitly convert a C-style array to a `base::span`. A `base::span` needs to be constructed explicitly from the C-style array and its size.

## Solution
The rewriter should generate an explicit `base::span` construction, passing in the C-style array and its size (calculated using `std::size`).

The rewriter can perform the following replacement:

```c++
-  base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)
-                                                     ? kPreferredVkFormats32
-                                                     : kPreferredVkFormats16;
+  base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)
+                                                     ? base::span(kPreferredVkFormats32, std::size(kPreferredVkFormats32))
+                                                     : base::span(kPreferredVkFormats16, std::size(kPreferredVkFormats16));

```

## Note
None