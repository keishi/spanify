# Build Failure Analysis: 2025_03_15_patch_427

## First error

../../net/base/address_tracker_linux.cc:50:48: error: cannot cast from type 'base::span<const struct ifinfomsg>' to pointer type 'char *'

## Category
Rewriter needs to add `.data()` when converting an argument to base::span, but the argument is used in a macro.

## Reason
The rewriter converted `const struct ifinfomsg* msg` to `base::span<const struct ifinfomsg> msg`. However, in line 50, the `msg` variable is used inside the macro `IFLA_RTA(msg)`. Since a span is not a pointer, it cannot be directly cast to `char*`. The rewriter should have added `.data()` to the `msg` variable when it is used in the macro, like this: `IFLA_RTA(msg.data())`.

## Solution
The rewriter should add `.data()` when a spanified variable is used inside a macro. The rewriter can use the AST to check if the spanified variable is inside a macro. Specifically the rewriter can use the `isExpandedFromMacro()` matcher.

## Note
There are other similar errors in the build failure log, such as line 52, 550, 552, 558, 559, 561, 564 and 566, that can be solved by applying the same solution.
Also, function `SafelyCastNetlinkMsgData` now returns `base::span<T>` rather than `T*`, which must be taken into account when accessing the returned value.