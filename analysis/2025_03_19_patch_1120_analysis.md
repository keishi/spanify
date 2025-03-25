# Build Failure Analysis: 2025_03_19_patch_1120

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('const base::span<int>' and 'void *const')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to compare a `base::span<int>` with `nullptr`. The `DCHECK_EQ` macro expands to use the `==` operator, which is not defined for this comparison.  The rewriter failed to recognize a raw pointer when a spanified variable is being compared to `nullptr`, and thus it failed to insert `.data()`.

## Solution
The rewriter needs to automatically add `.data()` when comparing a variable rewritten into `base::span` with raw pointer types like `nullptr` or `0`.
```
#before
DCHECK_EQ(wire_fds, static_cast<void*>(nullptr));

#after
DCHECK_EQ(wire_fds.data(), static_cast<void*>(nullptr));
```

## Note
There is a second error message regarding assignment. The variable `wire_fds` is initialized to `{}` and then assigned a `reinterpret_cast<int*>(CMSG_DATA(cmsg))`, which is a raw `int*`.
```
../../base/posix/unix_domain_socket.cc:164:18: error: no viable overloaded '='
  164 |         wire_fds = reinterpret_cast<int*>(CMSG_DATA(cmsg));
```
The rewriter needs to handle this by either converting the raw pointer to span using `base::make_span`, or creating temporary raw pointer.
```
#option 1
base::span<int> wire_fds = base::make_span(reinterpret_cast<int*>(CMSG_DATA(cmsg)), size);
```
or
```
#option 2
int* raw_wire_fds = reinterpret_cast<int*>(CMSG_DATA(cmsg));
base::span<int> wire_fds = raw_wire_fds;