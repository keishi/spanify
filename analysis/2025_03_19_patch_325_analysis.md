# Build Failure Analysis: 2025_03_19_patch_325

## First error
../../device/bluetooth/dbus/bluetooth_gatt_characteristic_service_provider_impl.cc:335:31: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `PopArrayOfBytes` takes a `const uint8_t**` as an argument, but the rewritten code is passing a `base::span<const uint8_t>*`. The rewriter failed to properly handle the function signature in `dbus/message.h`, which is treated as a third_party function even though it isn't.

## Solution
The rewriter needs to recognize the size info unavailable lhs and use the appropriate type conversions.

## Note
The rewriter is including `base/containers/span.h` inside a C++ file.