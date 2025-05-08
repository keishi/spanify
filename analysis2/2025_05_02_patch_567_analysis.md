# Build Failure Analysis: 2025_05_02_patch_567

## First error

../../gpu/command_buffer/service/webgpu_decoder_impl.cc:1395:31: error: no viable conversion from 'WGPUFeatureName *' to 'base::span<WGPUFeatureName>' (aka 'span<WGPUFeatureName>')

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The code allocates memory using `new WGPUFeatureName[count]` and attempts to assign the result (a raw pointer `WGPUFeatureName*`) to a `base::span<WGPUFeatureName>`.  `base::span` cannot be directly constructed from a raw pointer obtained from `new[]`. The `base::span` needs both the pointer and the size, and it does not know the size unless it is explicitly given.

The rewriter should recognize that `new WGPUFeatureName[count]` allocates an array on the heap. It does not have enough information to automatically manage the memory allocated by `new`.

## Solution
The rewriter should not attempt to rewrite the code in this case. Assignment of spanified variable from an allocation using new is not handled by the rewriter because this code should use a owned type like unique_ptr or a collection. If the rewriter does try to rewrite this pattern, it needs to use something like `std::unique_ptr<WGPUFeatureName[]>` or `std::vector<WGPUFeatureName>` to own the `new` allocation. It is better for the rewriter to not spanify when it encounters the `new WGPUFeatureName[count]` pattern.

## Note
The second error is due to the first.