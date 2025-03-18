# Build Failure Analysis: 2025_03_16_patch_1187

## First error

../../device/bluetooth/floss/floss_dbus_client.cc:382:31: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The code passes the address of the spanified variable `bytes` to the function `reader->PopArrayOfBytes`. The function expects a `const uint8_t**`, but receives `base::span<const uint8_t>*`.

```c++
  base::span<const uint8_t> bytes = {};
  size_t length = 0;

  if (reader->PopArrayOfBytes(&bytes, &length)) {
```

## Solution
The rewriter should create a temporary variable of type `const uint8_t*` initialized with `bytes.data()`, and pass the address of this temporary variable to the function. It should also take care to update the span after the function has been called. For the length parameter, the address of length can still be passed.

```c++
  base::span<const uint8_t> bytes = {};
  size_t length = 0;
  const uint8_t* bytes_data = bytes.data();

  if (reader->PopArrayOfBytes(&bytes_data, &length)) {
      bytes = base::span<const uint8_t>(bytes_data, length);
```

## Note
There are no additional errors to report.