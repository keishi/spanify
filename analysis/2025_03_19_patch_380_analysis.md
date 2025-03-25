# Build Failure Analysis: 2025_03_19_patch_380

## First error

../../device/fido/virtual_fido_device.cc:77:9: error: no matching function for call to 'CBB_finish'
   77 |         CBB_finish(cbb.get(), &der, &der_len));

## Category
Pointer passed into spanified function parameter.

## Reason
The function `CBB_finish` expects a `uint8_t**` as the second argument, but the rewriter is passing `base::span<uint8_t>*`.  The rewriter spanified `der` but didn't update the call to `CBB_finish` to adapt to it. The signature of the function is:

```c
OPENSSL_EXPORT int CBB_finish(CBB *cbb, uint8_t **out_data, size_t *out_len);
```

## Solution
The rewriter spanified a variable, but failed to spanify a call site.

The rewriter should not spanify `der` because it is being passed as `uint8_t**`. Since the address of `der` needs to be passed, the rewriter should skip spanifying it.

## Note

The rewriter added the span include:

```
+#include "base/containers/span.h"
```

It also added `.data()` to `OPENSSL_free` as well as data and subspan to the vector assignment, but those are secondary to this first error and caused by spanifying `der` in the first place.
```
-  OPENSSL_free(der);
+  OPENSSL_free(der.data());
```

```
-  std::vector<uint8_t> ret(der, der + der_len);
+  std::vector<uint8_t> ret(der.data(), der.subspan(der_len).data());