# Build Failure Analysis: 2025_03_19_patch_1446

## First error

../../ui/base/resource/data_pack.cc:266:19: error: no viable overloaded '='
  266 |   resource_table_ = reinterpret_cast<const Entry*>(&data[margin_to_skip]);

## Category
Rewriter does not handle assignment of spanified variable from std::begin/end.

## Reason
The rewriter spanified `resource_table_` but failed to update assignment at line 266. Today you cannot assign directly a `void*` to a span.
The error message indicates that there is no matching overloaded '=' operator to assign `const Entry*` to `base::span<const Entry, 18446744073709551615, raw_ptr<const Entry, partition_alloc::internal::RawPtrTraits::kAllowPtrArithmetic>>>`.

## Solution
Rewriter needs to be able to construct a `span` from `pointer` and `size`. 
The diff should look like this:
```diff
-  resource_table_ = reinterpret_cast<const Entry*>(&data[margin_to_skip]);
+  resource_table_ = base::span<const Entry>(reinterpret_cast<const Entry*>(&data[margin_to_skip]), 0);
```
Note that the size 0 will need to be updated later.

## Note
The other errors in the logs are due to similar missing conversions from raw pointers to span.