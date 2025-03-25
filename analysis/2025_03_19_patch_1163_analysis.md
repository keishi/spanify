# Build Failure Analysis: 2025_03_19_patch_1163

## First error

../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The static assertion indicates a type mismatch between the bound argument and the bound functor's parameter in `base::BindRepeating`. This likely means the rewriter is trying to spanify `DoRandomThing`, but `DoRandomThing`'s parameter is `std::array<MojoHandle, kNumWatchedHandles>&`, and `std::array` is not a `base::span` (because `TrapTest` does not inherit from `base::SupportsWeakPtr`). However, it appears that `base::BindRepeating` does not support spanified arguments, so we should avoid trying to spanify the call to it. Or, since the arguments to it are all constexpr, we may also just convert them to raw pointers and sizes.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying code for which `base::SupportsWeakPtr` is not a parent.

## Note
The problematic code uses `base::BindRepeating` with a static array `watched_handles`, where the lambda is indirectly requiring a `std::array<MojoHandle, kNumWatchedHandles>&` to convert to a `base::span`. Since `TrapTest` does not inherit from `base::SupportsWeakPtr`, this argument cannot be spanified. Thus we should avoid spanifying the call to `DoRandomThing`, or instead convert all arguments that are spans to raw pointers and a size.