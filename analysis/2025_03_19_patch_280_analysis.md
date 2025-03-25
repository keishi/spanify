```
# Build Failure Analysis: 2025_03_19_patch_280

## First error

../../gpu/command_buffer/service/webgpu_decoder_impl.cc:1362:31: error: no viable conversion from 'WGPUFeatureName *' to 'base::span<WGPUFeatureName>' (aka 'span<WGPUFeatureName>')
 1362 |   base::span<WGPUFeatureName> features = new WGPUFeatureName[count];
      |                               ^          ~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter doesn't handle assignment of spanified variable from an allocation using new.

## Reason
The code allocates memory using `new WGPUFeatureName[count]` and attempts to assign the raw pointer to a `base::span<WGPUFeatureName>`.  The rewriter converts the raw pointer allocation to a `base::span`, but `base::span` cannot take ownership of the memory allocated by `new`. A `base::span` is just a view over existing memory. It is not responsible for memory management.

## Solution
The rewriter doesn't handle this case, where a `new` allocation is assigned to a `base::span`. This pattern should not be spanified. The code should be using a container like `std::vector` or `base::unique_ptr` to manage the memory allocated by `new`.

## Note
The second error is a consequence of the first error. Because the assignment of the raw pointer fails, the code attempts to assign `features` to `features_out->features`. But the types are now mismatched.