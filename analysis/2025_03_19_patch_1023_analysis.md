# Build Failure Analysis: 2025_03_19_patch_1023

## First error
```
../../remoting/host/linux/gdbus_fd_list.cc:115:20: error: no viable conversion from 'gint *' (aka 'int *') to 'base::span<gint>' (aka 'span<int>')
  115 |   base::span<gint> fds = g_unix_fd_list_steal_fds(fd_list, &length);
      |                    ^     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `g_unix_fd_list_steal_fds` is a third-party function that returns a raw pointer (`gint*`, which is an `int*`) and a length. The rewriter is attempting to initialize a `base::span<gint>` with this raw pointer, but it's failing because there's no implicit conversion. The rewriter should generate code to construct a `base::span` from the raw pointer and length.

## Solution
The rewriter needs to wrap the third-party function's return value in a `base::span` constructor. This requires knowing the size of the span, which is provided by the `length` parameter.

The corrected code should be:

```c++
base::span<gint> fds(g_unix_fd_list_steal_fds(fd_list, &length), length);
```
## Note
The second error shows the .data() issue when trying to insert to a std::vector fds.data(), but this is a side effect of the original problem.