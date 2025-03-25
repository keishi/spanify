# Build Failure Analysis: 2025_03_19_patch_1734

## First error

../../net/quic/crypto/proof_source_chromium.cc:60:33: error: reinterpret_cast from 'std::string' (aka 'basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed
   60 |   base::span<const uint8_t> p = reinterpret_cast<const uint8_t*>(key_data);
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified `key_data` but left a reinterpret_cast that is applied to it. The rewriter should have been able to remove the `reinterpret_cast`.

## Solution
Rewriter needs to be able to remove it.

## Note
There are no other errors.