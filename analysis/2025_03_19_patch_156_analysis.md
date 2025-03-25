# Build Failure Analysis: 2025_03_19_patch_156

## First error

../../dbus/property.cc:547:39: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  547 |   if (!variant_reader.PopArrayOfBytes(&bytes, &length))
      |                                       ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `PopArrayOfBytes` function expects a `const uint8_t**`, but the spanified code passes the address of a `base::span<const uint8_t>`, which is a `base::span<const uint8_t>*`. The function should have been spanified, but it was not. This resulted in the rewriter failing to recognize a size info unavailable rhs value. The first argument to PopArrayOfBytes should be &bytes.data().

## Solution
The rewriter should recognize the size info unavailable rhs value, so that the first argument can be rewritten correctly to &bytes.data().

## Note
The secondary error shows a related problem as a result of the first argument not being corrected:

```
../../dbus/property.cc:547:50: error: no member named 'subspan' in 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  547 |   value_.assign(bytes.data(), bytes.subspan(length).data());
      |                                      ~~~~~~~ ^