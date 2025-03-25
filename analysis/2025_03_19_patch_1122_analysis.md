```
# Build Failure Analysis: 2025_03_19_patch_1122

## First error

../../dbus/message_unittest.cc:242:38: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MessageReader::PopArrayOfBytes` expects a `const uint8_t** bytes` but after the rewriter changes, `output_bytes` is of type `base::span<const uint8_t>`. The function's parameter type was not updated by the rewriter, so there is a type mismatch.

## Solution
The rewriter needs to also update the call sites of spanified functions. In this case, the `MessageReader::PopArrayOfBytes` function should be updated.

## Note
None