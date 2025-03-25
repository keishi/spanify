# Build Failure Analysis: 2025_03_19_patch_2013

## First error

../../components/commerce/core/webui/shopping_service_handler.cc:234:59: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  234 |       commerce::kProductSpecificationsLoggingPrefix.data().subspan(
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified `kProductSpecificationsLoggingPrefix`, but it is using `.data()` and then calling `.subspan()`. Because the return value of `.data()` is a `char*`, you can't call `.subspan()` on it. The rewriter failed to realize that this pattern needed to add `.data()` to the return value.

## Solution
The rewriter needs to be able to rewrite this pattern to pass `.data()` to a spanified return value.

## Note
There is a second error which is the same as the first.
```
../../components/commerce/core/webui/shopping_service_handler.cc:727:67: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  727 |             : commerce::kProductSpecificationsLoggingPrefix.data().subspan(
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~