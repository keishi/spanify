```
# Build Failure Analysis: 2025_03_19_patch_1164

## First error

../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.
 1603 |       static_assert(v,
      |                     ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `DoRandomThing`, but `g_do_random_thing_callback` is a global variable. Therefore the rewriter has to rewrite the assignment to that global variable as well. However `g_do_random_thing_callback` is in a header, so it will be included by many files. If those files are not also spanified at the same time, then they will have mismatched types. This is why the static assertion failed.

## Solution
The rewriter should not rewrite the function because it requires rewriting global code outside the scope of the patch.

## Note
The assignment to `g_do_random_thing_callback` looks like this:
```c++
g_do_random_thing_callback = base::BindRepeating(
      &DoRandomThing, traps, kNumTraps, watched_handles, kNumWatchedHandles);
```
This is passing `traps` which has type `std::array<MojoHandle, kNumTraps>` into the `DoRandomThing` function which has type `MojoHandle*`. This likely requires changing the `base::BindRepeating` call to adapt the arguments.