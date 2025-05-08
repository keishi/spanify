# Build Failure Analysis: 2025_05_02_patch_1723

## First error

../../ui/base/resource/data_pack.cc:266:19: error: no viable overloaded '='
  266 |   resource_table_ = reinterpret_cast<const Entry*>(&data[margin_to_skip]);
      |   ~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1044:19: note: candidate function not viable: no known conversion from 'const Entry *' to 'const span<const ui::DataPack::Entry, 18446744073709551615, base::raw_ptr<const ui::DataPack::Entry, partition_alloc::internal::RawPtrTraits::kAllowPtrArithmetic>>>' for 1st argument
 1044 |   constexpr span& operator=(const span& other) noexcept = default;
      |                   ^         ~~~~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The error occurs because the rewriter changed `resource_table_` from a raw pointer (`raw_ptr<const Entry, AllowPtrArithmetic>`) to a raw span (`base::raw_span<const Entry, AllowPtrArithmetic>`). The code then attempts to assign a raw pointer to this raw span, which is not allowed.  The `base::raw_span` cannot be directly assigned a pointer. This is because `reinterpret_cast<const Entry*>(&data[margin_to_skip])` returns a raw pointer, but the `resource_table_` is now a `base::raw_span` and requires a proper span object for assignment.

## Solution
The rewriter needs to construct a `base::raw_span` from the pointer, providing the pointer and the size. Because the size is not easily known at this location, this is not the right refactoring. The rewriter should not have refactored this line. It should have kept `resource_table_` as a `raw_ptr`.

## Note
The other errors are all related to this initial error. They are happening because the code is now trying to do arithmetic on the span instead of a pointer.