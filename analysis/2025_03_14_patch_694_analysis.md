# Build Failure Analysis: 2025_03_14_patch_694

## First error

../../remoting/signaling/ftl_host_device_id_provider.cc:31:43: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   31 |   device_id_.set_id(kDeviceIdPrefix.data().subspan(host_id));
      |                     ~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string subspan().

## Reason
The code attempts to use `.subspan()` on a `std::array`, but the `set_id` function expects a `const char*`. The rewriter failed to add `.data()` after the `.subspan()`. The `subspan()` method should be applied on the `.data()` pointer. The `.data()` method converts the `std::array` to a `char*` type.

## Solution
The rewriter should add `.data()` after `.subspan()`. The correct code will be `kDeviceIdPrefix.data().subspan(0, 16).data()`.

## Note
The `kDeviceIdPrefix` is already rewritten by spanify so the category "Rewriter needs to add .data() to char[] converted to std::array passed to `base::StringPrintf`." does not fit.