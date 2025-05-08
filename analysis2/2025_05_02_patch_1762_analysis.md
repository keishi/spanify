# Build Failure Analysis: 2025_05_02_patch_1762

## First error

../../base/containers/span.h:945:33: error: cannot form a reference to 'void'
  945 |   using reference = element_type&;
      |                                 ^
../../gpu/command_buffer/client/buffer_tracker.h:89:26: note: in instantiation of template class 'base::span<void, 18446744073709551615, base::raw_ptr<void, partition_alloc::internal::RawPtrTraits::kAllowPtrArithmetic>>' requested here
   89 |     base::raw_span<void> address_;
      |                          ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to rewrite `address_` to `base::raw_span<void>`. However `base::raw_span<void>` resolves to `base::span<void>`, but `base::span<void>` is not allowed because you can't have a reference to `void`. `base::span<void>` is excluded, therefore we shouldn't rewrite code if it requires us to create a span of void.

## Solution
The rewriter should avoid spanifying functions/members if it requires spanifying excluded code. Specifically in this case the rewriter changed `void*` to `base::raw_span<void>`, but this is not valid.