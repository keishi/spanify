# Build Failure Analysis: 2025_05_02_patch_970

## First error

../../base/strings/escape.cc:237:29: error: reinterpret_cast from 'std::array<unsigned char, 4>' to 'char *' is not allowed
  237 |   if (!ReadUnicodeCharacter(reinterpret_cast<char*>(bytes), num_bytes,
      |                             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter converted `bytes` from a C-style array to `std::array`. However, the code still uses `reinterpret_cast` to cast the `std::array` to a `char*`, which is not allowed. The rewriter should have removed the `reinterpret_cast` as part of the conversion.

## Solution
The rewriter needs to be able to remove the reinterpret_cast when spanifying the underlying variable. Change:
`reinterpret_cast<char*>(bytes)`
to
`bytes.data()`
or similar, depending on the context.