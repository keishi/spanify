# Build Failure Analysis: 2025_03_19_patch_1727

## First error

../../chrome/browser/enterprise/reporting/extension_request/extension_request_notification.cc:103:57: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  103 |                           GURL(kChromeWebstoreUrl.data().subspan(extension_id)),
      |                                ~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter converted `kChromeWebstoreUrl` to `std::array`, and the code is now trying to call `subspan()` on the return value of `kChromeWebstoreUrl.data()`. Because `kChromeWebstoreUrl.data()` is now a span, `subspan()` must be called using `.` instead of `->`. Also, the subspan rewrite should add `.data()` at the end.

## Solution
The rewriter should change the code to use `.` to call `subspan()` and add `.data()` to the return value.

For example, the following code:

```c++
GURL(kChromeWebstoreUrl.data().subspan(extension_id))
```

should be rewritten to:

```c++
GURL(kChromeWebstoreUrl.data().subspan(extension_id).data())
```
## Note
No additional errors.