# Build Failure Analysis: 2025_05_02_patch_1421

## First error

../../sandbox/linux/syscall_broker/broker_permission_list.cc:30:24: error: no viable overloaded '='
   30 |     permissions_array_ = &permissions_[0];
      |     ~~~~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from std::begin/end.

## Reason
The rewriter changed the type of `permissions_array_` to `base::raw_span`. However, it did not change the code assigning to it, `permissions_array_ = &permissions_[0];`. This is equivalent to assigning from `std::begin(permissions_)`, which is not handled. The correct way is to create a span from `std::begin` and `std::end`.

## Solution
The rewriter should convert the assignment to use the `base::span` constructor.
Change
`permissions_array_ = &permissions_[0];`
to
`permissions_array_ = base::make_span(&permissions_[0], permissions_.size());`

## Note
The rewriter should also handle nullptr initialization by using {}. This happened in this patch as well.
```diff
--- a/sandbox/linux/syscall_broker/broker_permission_list.cc
+++ b/sandbox/linux/syscall_broker/broker_permission_list.cc
@@ -12,6 +12,8 @@
 #include <string>
 #include <vector>
 
+#include "base/containers/span.h"
+
 namespace sandbox {
 namespace syscall_broker {
 
@@ -27,7 +29,7 @@ BrokerPermissionList::BrokerPermissionList(
   if (num_of_permissions_ > 0) {
     permissions_array_ = &permissions_[0];
   } else {
-    permissions_array_ = nullptr;
+    permissions_array_ = {};
   }
 }
```
The correct way is:
`permissions_array_ = num_of_permissions_ > 0 ? base::make_span(&permissions_[0], permissions_.size()) : base::span<const BrokerFilePermission>{};`