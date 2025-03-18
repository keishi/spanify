# Build Failure Analysis: 2025_03_14_patch_1165

## First error

../../gpu/command_buffer/service/command_buffer_service.h:151:7: error: no viable conversion from 'std::nullptr_t' to 'base::raw_span<volatile CommandBufferEntry, AllowPtrArithmetic>' (aka 'span<volatile CommandBufferEntry, dynamic_extent, raw_ptr<volatile CommandBufferEntry, (RawPtrTraits)8U | AllowPtrArithmetic>>')

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter converted `buffer_` to a `base::raw_span`, but failed to update the initialization from `nullptr` to `{}`. `base::raw_span` does not allow initialization from `nullptr`.

## Solution
Rewriter can rewrite variable initialization from nullptr to use {}, but misses member field initialization. This pattern must be added to the rewriter.

## Note
Multiple files failed to compile.