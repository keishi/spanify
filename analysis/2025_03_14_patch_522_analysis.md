# Build Failure Analysis: 2025_03_14_patch_522

## First error

../../third_party/blink/renderer/core/layout/physical_fragment.h:608:57: error: no viable conversion from 'std::nullptr_t' to 'base::span<const PhysicalFragmentLink>'
  608 |       base::span<const PhysicalFragmentLink> current_ = nullptr;
      |                                                         ^~~~~~~

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The code initializes a `base::span` member field `current_` to `nullptr`.  The spanified type `base::span` does not have an implicit conversion from `nullptr`. This was missed when rewriting the code. The rewriter should use `{}` for initialization instead of `nullptr`.

## Solution
The rewriter should use `{}` for initializing spanified member fields.

For example:
```c++
base::span<const int> field_ = nullptr;
```

should be rewritten as:

```c++
base::span<const int> field_ = {};
```

## Note
There are also errors with operator + between base::span and wtf_size_t, but those are secondary to the first error.