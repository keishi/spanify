# Build Failure Analysis: 2025_05_02_patch_1625

## First error

../../device/bluetooth/floss/floss_adapter_client.cc:240:51: error: member reference base type 'const char[]' is not a structure or union
  240 |   exported_callback_path_ = kExportedCallbacksPath.data() +
      |                             ~~~~~~~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kExportedCallbacksPath` to `std::array`, but the code uses `.data()` and pointer arithmetic to append to it. This is not valid for `std::array`, so `.data()` should have been added to `kExportedCallbacksPath`. The member `exported_callback_path_` is of type `std::string`.

## Solution
The rewriter should add `.data()` when an arrayified `char[]` variable is used with pointer arithmetic and assigned to a `std::string`.