# Build Failure Analysis: 2025_05_02_patch_475

## First error

../../device/bluetooth/floss/floss_dbus_client.cc:382:31: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `dbus::MessageReader::PopArrayOfBytes` expects a `const uint8_t**` as its first argument, but the rewriter spanified the `bytes` variable to `base::span<const uint8_t>`. Thus it is passing the address of a `base::span<const uint8_t>`, i.e. `base::span<const uint8_t>*` to the function, leading to a type mismatch. The rewriter spanified the variable `bytes`, but failed to spanify the call site.

## Solution
The rewriter needs to spanify the call site in addition to spanifying the variable.
```c++
// Before
base::span<const uint8_t> bytes = {};
if (reader->PopArrayOfBytes(&bytes, &length)) {

// After
const uint8_t* bytes_ptr = nullptr;
if (reader->PopArrayOfBytes(&bytes_ptr, &length)) {
  base::span<const uint8_t> bytes(bytes_ptr, length);
```

## Note
None