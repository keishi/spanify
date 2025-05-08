# Build Failure Analysis: 2025_05_02_patch_1149

## First error

```
../../net/base/address_tracker_linux.cc:50:48: error: cannot cast from type 'base::span<const struct ifinfomsg>' to pointer type 'char *'
   50 |   for (const struct rtattr* attr = UNSAFE_TODO(IFLA_RTA(msg));
      |                                    ~~~~~~~~~~~~^~~~~~~~~~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/linux/if_link.h:391:41: note: expanded from macro 'IFLA_RTA'
  391 | #define IFLA_RTA(r)  ((struct rtattr*)(((char*)(r)) + NLMSG_ALIGN(sizeof(struct ifinfomsg))))
      |                                         ^
../../base/compiler_specific.h:1060:41: note: expanded from macro 'UNSAFE_TODO'
 1060 | #define UNSAFE_TODO(...) UNSAFE_BUFFERS(__VA_ARGS__)
      |                          ~~~~~~~~~~~~~~~^~~~~~~~~~~~
../../base/compiler_specific.h:1042:3: note: expanded from macro 'UNSAFE_BUFFERS'
 1042 |   __VA_ARGS__                                \
      |   ^~~~~~~~~~~
```

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The macro `IFLA_RTA` expects a pointer to `struct ifinfomsg`, but the rewriter has converted `msg` to a `base::span<const struct ifinfomsg>`. The macro then tries to cast the `span` to `char*` which fails. `IFLA_RTA` likely takes the address of the `struct ifinfomsg`. Today the rewriter cannot deal with the address of a spanified variable being taken.

## Solution
The rewriter needs to create a temporary variable to pass to the macro, and then use the temporary variable to create a new span.
```c++
const struct ifinfomsg* msg_ptr = msg.data();
for (const struct rtattr* attr = UNSAFE_TODO(IFLA_RTA(msg_ptr));
     RTA_OK(attr, length); attr = UNSAFE_TODO(RTA_NEXT(attr, length))) {
```

## Note
Many other errors exist in the build log related to accessing members of the spanified `msg` using the arrow operator `->` rather than the dot operator `.`. In addition, there is an error about comparing a span to nullptr. All these errors are caused by this same root cause of failing to pass the address of a spanified variable.