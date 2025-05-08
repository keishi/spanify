# Build Failure Analysis: 2025_05_02_patch_182

## First error

../../gpu/vulkan/vulkan_surface.cc:150:30: error: no viable conversion from 'const VkFormat *' to 'base::span<const VkFormat>' (aka 'span<const VkFormat>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer.

## Reason
The code attempts to assign a raw pointer `kPreferredVkFormats32` or `kPreferredVkFormats16` to a `base::span<const VkFormat>`. `base::span` does not have an implicit constructor that takes a raw pointer. The rewriter should have generated the code to explicitly create a `base::span` from the raw pointer. The sizes are known statically, so the rewriter can use the two-argument constructor of `base::span`.

## Solution
The rewriter needs to wrap the raw pointer with a `base::span` constructor, explicitly providing the data pointer and size. The code should be rewritten as follows:

```c++
  base::span<const VkFormat> preferred_formats = (format == FORMAT_RGBA_32)
                                                     ? base::span(kPreferredVkFormats32, std::size(kPreferredVkFormats32))
                                                     : base::span(kPreferredVkFormats16, std::size(kPreferredVkFormats16));
```

## Note
The error message indicates that none of the `base::span` constructors can accept a raw pointer. The root cause is that the rewriter did not generate the necessary code to construct the span correctly.