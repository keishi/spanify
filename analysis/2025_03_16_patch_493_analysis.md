# Build Failure Analysis: 2025_03_16_patch_493

## First error

../../device/bluetooth/dbus/bluetooth_gatt_characteristic_service_provider_impl.cc:386:31: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  386 |   if (!reader.PopArrayOfBytes(&bytes, &length)) {
      |                               ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The function `PopArrayOfBytes` in `message.h` takes a `const uint8_t**` as an argument, but the rewriter declared `bytes` as `base::span<const uint8_t>`. The address of this span `&bytes` was then passed to `PopArrayOfBytes`, but it expects `const uint8_t**`.

## Solution
The rewriter should recognize this pattern and generate a fix to rewrite the calling parameter.

To solve this specific error the rewriter should create a const uint8_t* from the span bytes and pass that variable.

Example:
```c++
  base::span<const uint8_t> bytes = {};
  const uint8_t* bytes_ptr = bytes.data();
  size_t length = 0;
  if (!reader.PopArrayOfBytes(&bytes_ptr, &length)) {

```

## Note

Other errors include:
```
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^
1 error generated.