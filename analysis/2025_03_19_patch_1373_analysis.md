# Build Failure Analysis: 2025_03_19_patch_1373

## First error

../../third_party/blink/renderer/core/layout/physical_fragment.h:608:57: error: no viable conversion from 'std::nullptr_t' to 'base::span<const PhysicalFragmentLink>'

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter spanified `PhysicalFragment::ConstIterator::current_` which resulted in the initialization with `nullptr` being invalid. The rewriter should have replaced the initialization with `{}`.

## Solution
The rewriter needs to initialize spanified member fields with `{}` instead of `nullptr`. This applies to member variables, and not only local variables.

## Note
The second error shows an attempt to add a `wtf_size_t` to a span:

```
../../third_party/blink/renderer/core/layout/physical_fragment.h:567:57: error: invalid operands to binary expression ('base::span<const PhysicalFragmentLink>' and 'wtf_size_t' (aka 'unsigned int'))
  567 |           : current_(current), end_(UNSAFE_TODO(current + size)) {
```

This is because the type of current_ was changed to `base::span<const PhysicalFragmentLink>`, but the code still attempts to add the raw pointer and size_ variables. The rewriter needs to be updated to rewrite span arithmetic by using `subspan()` instead.