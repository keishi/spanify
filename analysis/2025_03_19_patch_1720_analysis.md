# Build Failure Analysis: 2025_03_19_patch_1720

## First error

../../components/history/core/browser/history_types.cc:104:10: error: no viable conversion from returned value of type 'const ValueType<allocator<unsigned long>> *' (aka 'const unsigned long *') to function return type 'const base::span<size_t>' (aka 'const span<unsigned long>')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The function `QueryResults::MatchesForURL` was modified to return `base::span<size_t>`. The implementation returns `&found->second.front()`, which is a raw pointer to the first element of a `std::vector<size_t>`. There is no implicit conversion from `size_t*` to `base::span<size_t>`. The rewriter should have automatically added `.data()` after `&found->second.front()`.

## Solution
The rewriter needs to add `.data()` to the returned expression to convert the pointer to `base::span`.

## Note
The other error occurs because after spanifying the return value at the definition, the call sites were not updated.