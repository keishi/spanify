# Build Failure Analysis: 2025_03_16_patch_1122

## First error

../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.
 1603 |       static_assert(v,
      |                     ^

## Category
Rewriter needs to ensure that bound arguments types match after array to std::array rewrite.

## Reason
The compiler error indicates a type mismatch between the bound argument and the bound functor's parameter. This happens in the `base::BindRepeating` call, likely because the type of `traps` was changed from `MojoHandle[]` to `std::array<MojoHandle, kNumTraps>`. `base::BindRepeating`'s type deduction seems to be sensitive to this change. A pointer is expected, but `std::array` gets passed by value.

## Solution
Change `base::BindRepeating` to pass the `std::array` as a pointer or reference. Change `traps` to `traps.data()` to make it a raw pointer.
Note: `kNumTraps` must be known at compile time so you can't use `base::span` in this case.

## Note
The type of g_do_random_thing_callback is `base::RepeatingCallback<void ()>` which is incorrect because it takes arguments.
```
void DoRandomThing(MojoHandle* traps,
                               size_t num_traps,
                               MojoHandle* watched_handles,
                               size_t num_watched_handles)