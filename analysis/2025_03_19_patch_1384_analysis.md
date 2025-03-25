# Build Failure Analysis: 2025_03_19_patch_1384

## First error

../../device/fido/p256_public_key.cc:62:9: error: no matching function for call to 'CBB_finish'
   62 |         CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));
      |         ^~~~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified variable.

## Reason
The rewriter converted `uint8_t* der_bytes` to `base::span<uint8_t> der_bytes`, but the `CBB_finish` function expects a `uint8_t**` as its second argument. The rewriter should have added `.data()` to `der_bytes` to get a `uint8_t*` and then taken the address of that.

## Solution
The rewriter should recognize when a spanified variable is being passed to a function that expects a raw pointer and add `.data()` to the variable.

## Note
The code also has a secondary error where it calls `der_bytes.subspan()` and then adds `.data()` to the result, but `der_bytes` is already a span, so that is not correct. It should add `.data()` to `der_bytes` first, and then call `subspan()` on that result.

```
-  std::vector<uint8_t> ret(der_bytes.data(),
-                           der_bytes.subspan(der_bytes_len).data());
+  std::vector<uint8_t> ret(der_bytes.data(),
+                           der_bytes.subspan(der_bytes_len).data());