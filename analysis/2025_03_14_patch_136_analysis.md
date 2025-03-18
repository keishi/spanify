# Build Failure Analysis: 2025_03_14_patch_136

## First error

../../device/fido/cable/v2_handshake.cc:505:36: error: no matching conversion for functional-style cast from 'uint64_t *' (aka 'unsigned long *') to 'base::span<uint64_t, 1>' (aka 'span<unsigned long, 1>')

## Category
Rewriter produced incorrect code for constructing a span from a variable's address.

## Reason
The code attempts to create a span from the address of a `uint64_t` variable `v` using `base::span<uint64_t, 1>(&v)`. This is invalid because the `base::span` constructor expects an array, not a pointer. Also, the subsequent reinterpret_cast to `uint8_t*` is disallowed by the plugin.

## Solution
The rewriter should generate a span from the `uint64_t` variable `v` without taking its address. Then a data() call can be made before reinterpreting.

## Note
Extra error: `reinterpret_cast from 'base::span<uint64_t, 1>' (aka 'span<unsigned long, 1>') to 'uint8_t *' (aka 'unsigned char *') is not allowed`