# Build Failure Analysis: 2025_05_02_patch_564

## First error
../../remoting/host/linux/gdbus_fd_list.cc:118:20: error: no viable conversion from 'gint *' (aka 'int *') to 'base::span<gint>' (aka 'span<int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `g_unix_fd_list_steal_fds` is a glib function (third party). The rewriter changed the return type of the function call `g_unix_fd_list_steal_fds` to `base::span<gint>`, however it did not generate the code to create a `base::span` from the raw pointer returned by `g_unix_fd_list_steal_fds`. The error message "no viable conversion from 'gint *' (aka 'int *') to 'base::span<gint>'" confirms this.

## Solution
The rewriter needs to generate code to construct a span from the return value of `g_unix_fd_list_steal_fds`. The corrected line would be:
```c++
base::span<gint> fds(g_unix_fd_list_steal_fds(fd_list, &length), length);
```
However, this requires that the rewriter check that `g_unix_fd_list_steal_fds` isn't `nullptr`. The best code would be:
```c++
gint* raw_fds = g_unix_fd_list_steal_fds(fd_list, &length);
base::span<gint> fds(raw_fds, length);
```

## Note
The rewriter failed to add `.data()` to the argument to `g_free(fds.data());` and also caused an error when adding the span `UNSAFE_BUFFERS(fds + length));`