```
# Build Failure Analysis: 2025_03_19_patch_769

## First error

../../sandbox/linux/syscall_broker/broker_permission_list.cc:30:24: error: no viable overloaded '='

## Category
Rewriter does not handle assignment of raw pointer to `base::span` variable.

## Reason
The rewriter spanified `permissions_array_`, changing it from a raw pointer to a `base::span`. The original code assigned the address of the first element of the `permissions_` vector to `permissions_array_`. This is no longer a valid assignment, as a `base::span` cannot be directly assigned a raw pointer.

## Solution
The rewriter should generate a `base::span` using the data and size of the `permissions_` vector. The rewriter also changed the `{}` which is also a valid approach. So we want to remove both changes.

```diff
   if (num_of_permissions_ > 0) {
     permissions_array_ = &permissions_[0];
   } else {
-    permissions_array_ = {};
+    permissions_array_ = nullptr;
   }
```

```diff
  // permissions_array_ is set up to point to the backing store of
  // permissions_ and is used in async signal safe methods.
-  base::raw_span<const BrokerFilePermission, AllowPtrArithmetic>
-      permissions_array_;
+  raw_ptr<const BrokerFilePermission, AllowPtrArithmetic> permissions_array_;
   const size_t num_of_permissions_;

```

## Note
N/A