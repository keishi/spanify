# Build Failure Analysis: 2025_03_19_patch_755

## First error

../../device/fido/rsa_public_key.cc:89:9: error: no matching function for call to 'CBB_finish'
   89 |         CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));
      |         ^~~~~~~~~~
../../base/check.h:278:59: note: expanded from macro 'CHECK'

## Category
Rewriter needs to avoid spanifying variables if it requires spanifying excluded code.

## Reason
The function `CBB_finish` in `third_party/boringssl/src/include/openssl/bytestring.h` expects a `uint8_t**` as the second argument, but the rewriter spanified the `der_bytes` variable to `base::span<uint8_t>`. The rewriter then attempts to pass the address of `der_bytes` (&der_bytes) which is of type `base::span<uint8_t>*` to `CBB_finish`, causing a compile error.

The root cause is that the rewriter chose to spanify code that interfaces with an excluded third_party library.

## Solution
The rewriter should avoid spanifying `der_bytes` because it is passed as an argument to `CBB_finish` which is defined in the `third_party` directory and therefore is excluded from spanification.

## Note
The rewriter added `#include "base/containers/span.h"` to the header file and made the following spanification:
```diff
--- a/device/fido/rsa_public_key.cc
+++ b/device/fido/rsa_public_key.cc
@@ -80,14 +82,15 @@ std::unique_ptr<PublicKey> RSAPublicKey::ExtractFromCOSEKey(
   CHECK(EVP_PKEY_assign_RSA(pkey.get(), rsa.release()));
 
   bssl::ScopedCBB cbb;
-  uint8_t* der_bytes = nullptr;
+  base::span<uint8_t> der_bytes = {};
   size_t der_bytes_len = 0;
   CHECK(CBB_init(cbb.get(), /* initial size */ 128) &&
         EVP_marshal_public_key(cbb.get(), pkey.get()) &&
         CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));
 
-  std::vector<uint8_t> der_bytes_vec(der_bytes, der_bytes + der_bytes_len);
-  OPENSSL_free(der_bytes);
+  std::vector<uint8_t> der_bytes_vec(der_bytes.data(),
+                                     der_bytes.subspan(der_bytes_len).data());
+  OPENSSL_free(der_bytes.data());

   return std::make_unique<PublicKey>(algorithm, cbor_bytes,
                                      std::move(der_bytes_vec));