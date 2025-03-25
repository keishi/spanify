# Build Failure Analysis: 2025_03_19_patch_159

## First error

../../dbus/property.cc:761:49: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  761 |       if (!value_variant_reader.PopArrayOfBytes(&bytes, &length))
      |                                                 ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `PopArrayOfBytes` expects a `const uint8_t** bytes` as an argument.  The rewriter replaced `const uint8_t* bytes` with `base::span<const uint8_t> bytes`.  It then attempted to pass `&bytes` to `PopArrayOfBytes`.  However, `&bytes` is a `base::span<const uint8_t>*`, which cannot be implicitly converted to `const uint8_t**`. The correct solution is to not spanify this function. If this code is generated, then we need to avoid spanifying functions that require spanifying excluded code.

## Solution
The rewriter should avoid rewriting `bytes` to `base::span<const uint8_t>` because `PopArrayOfBytes` is expecting `const uint8_t**`. The rewriter should not spanify the function `Property<std::map<uint16_t, std::vector<uint8_t>>>::PopValueFromReader` to prevent this from happening.

## Note
The rewriter replaced `const uint8_t* bytes` with `base::span<const uint8_t> bytes`, but didn't change the function signature for `PopArrayOfBytes`.
There is an additional error:
```
../../dbus/property.cc:764:41: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  764 |       if (!entry_reader.PopArrayOfBytes(&bytes, &length))
      |                                         ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^
```
This error is the same as the first error and is caused by the same root cause.