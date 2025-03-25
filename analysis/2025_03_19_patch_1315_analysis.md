# Build Failure Analysis: 2025_03_19_patch_1315

## First error

../../mojo/public/cpp/base/big_buffer.h:124:12: error: const_cast from 'const mojo_base::BigBuffer' to 'uint8_t *' (aka 'unsigned char *') is not allowed
  124 |     return const_cast<uint8_t*>(std::as_const(*this));
      |            ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter dropped mutable qualifier.

## Reason
The `data()` method in `BigBuffer` was intended to be mutable, but spanifying it and adding const to the method made it const, which resulted in error when assigning it to a mutable pointer in the implementation.

## Solution
The correct solution is to restore the mutable qualifier, and make the return type a span.
```
base::span<uint8_t> data() {
    return const_cast<uint8_t*>(std::as_const(*this));
  }
```

## Note
The rest of the errors are likely secondary to this first error.