# Build Failure Analysis: 2025_03_19_patch_545

## First error

../../remoting/signaling/ftl_host_device_id_provider.cc:31:43: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   31 |   device_id_.set_id(kDeviceIdPrefix.data().subspan(host_id));
      |                     ~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter arrayified `kDeviceIdPrefix` and then attempted to call `.data().subspan()` on it. However, it looks like the rewriter didn't properly rewrite `.data()` so it is trying to call `subspan` on a `char*` type, which doesn't have that method.

## Solution
The rewriter needs to make sure to rewrite any methods that are called on an arrayified variable so the replacements chain correctly.

## Note
Consider adding a test case to prevent regressions.