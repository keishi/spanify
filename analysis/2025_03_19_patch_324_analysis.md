# Build Failure Analysis: 2025_03_19_patch_324

## First error

../../device/bluetooth/dbus/bluetooth_gatt_characteristic_service_provider_impl.cc:386:31: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `dbus::MessageReader::PopArrayOfBytes` expects a `const uint8_t**` as its first argument, but the rewriter has changed `bytes` to be a `base::span<const uint8_t>`. Thus a `base::span<const uint8_t>*` is passed to `PopArrayOfBytes` which is not compatible with the expected `const uint8_t**`. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter needs to recognize that `dbus::MessageReader::PopArrayOfBytes` is used and correctly pass the pointer and the length separately from the span.

## Note
This is an example of pointer passed into spanified function parameter.