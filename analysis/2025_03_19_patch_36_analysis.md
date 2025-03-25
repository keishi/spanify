# Build Failure Analysis: 2025_03_19_patch_36

## First error

../../device/fido/cable/v2_handshake.cc:542:36: error: no matching conversion for functional-style cast from 'uint64_t *' (aka 'unsigned long *') to 'base::span<uint64_t, 1>' (aka 'span<unsigned long, 1>')
  542 |         reinterpret_cast<uint8_t*>(base::span<uint64_t, 1>(&v));
      |                                    ^~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified a variable but left a reinterpret_cast that is applied to it. In this case, it is trying to cast an address of a variable to a base::span. This doesn't work because base::span takes the actual variable.

## Solution
The rewriter should be able to remove it or replace it with `.data()`. It should instead use a subspan to create a temporary variable, and not use reinterpret_cast.

## Note
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.
Also, there is a reinterpret_cast from `base::span<uint64_t, 1>` to `uint8_t *` which is also an error.