# Build Failure Analysis: 2025_03_19_patch_158

## First error

../../dbus/property.cc:690:49: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  690 |       if (!value_variant_reader.PopArrayOfBytes(&bytes, &length))
      |                                                 ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function that this argument is being passed to was spanified, but this call site is passing a raw pointer where the size is not available. `bytes` is assigned to a `base::span<const uint8_t>`, and the address of that span is being passed to `PopArrayOfBytes`, which expects a `const uint8_t**`. The rewriter didn't identify that `PopArrayOfBytes` is receiving size information unavailable rhs value, i.e. `bytes`

## Solution
The rewriter needs to recognize size info unavailable rhs values and correctly rewrite the code. We should probably not rewrite this in the first place and instead exclude it.

## Note
The second error message confirms the same root cause, but on a different line.