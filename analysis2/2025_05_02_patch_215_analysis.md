# Build Failure Analysis: 2025_05_02_patch_215

## First error

../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.
 1603 |       static_assert(v,
      |                     ^

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The error indicates a type mismatch between a bound argument and a bound functor's parameter within the `base::BindRepeating` call. This is happening in the line `g_do_random_thing_callback = base::BindRepeating(...)`. `traps` which is now a `std::array`, is being passed by reference into the `base::BindRepeating`. base::BindRepeating does not know how to handle `std::array` by reference.

## Solution
The rewriter needs to recognize when a variable that has been arrayified is passed into a `base::BindRepeating` call. The rewriter should add `.data()` to the variable like this:

```c++
  g_do_random_thing_callback = base::BindRepeating(
      &DoRandomThing, traps.data(), kNumTraps, watched_handles, kNumWatchedHandles);
```

Alternatively, it should create a temporary variable, assign the array to the temporary variable, and pass the temporary variable to the function.

## Note
The second error confirms this analysis because it indicates that `base::BindRepeating` is having trouble assigning to `g_do_random_thing_callback`.