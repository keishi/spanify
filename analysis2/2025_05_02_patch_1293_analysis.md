# Build Failure Analysis: 2025_05_02_patch_1293

## First error

```
../../device/fido/p256_public_key.cc:62:9: error: no matching function for call to 'CBB_finish'
   62 |         CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));
      |         ^~~~~~~~~~
../../third_party/boringssl/src/include/openssl/bytestring.h:500:20: note: candidate function not viable: no known conversion from 'base::span<uint8_t> *' (aka 'span<unsigned char> *') to 'uint8_t **' (aka 'unsigned char **') for 2nd argument
  500 | OPENSSL_EXPORT int CBB_finish(CBB *cbb, uint8_t **out_data, size_t *out_len);
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The `CBB_finish` function takes a `uint8_t **out_data` as an argument, but the rewriter has spanified `der_bytes` to `base::span<uint8_t>`. The `CBB_finish` function is part of third_party/boringssl, so it cannot be rewritten. The rewriter needs to avoid spanifying local variables that are passed into third party code as a pointer.

## Solution
The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
The diff also shows a call to `OPENSSL_free(der_bytes.data());` which is good.