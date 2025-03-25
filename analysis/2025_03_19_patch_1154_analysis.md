# Build Failure Analysis: 2025_03_19_patch_1154

## First error

../../device/fido/ed25519_public_key.cc:91:9: error: no matching function for call to 'CBB_finish'
   91 |         CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));
      |         ^~~~~~~~~~
../../base/check.h:278:59: note: expanded from macro 'CHECK'
  278 |   BASE_IF(BASE_IS_EMPTY(__VA_ARGS__), CHECK_INTERNAL_IMPL(cond), \
      |                                                           ^~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The first error is in the line `CBB_finish(cbb.get(), &der_bytes, &der_bytes_len));`.
`CBB_finish` expects a `uint8_t**` as the second argument, but the rewriter is passing `&der_bytes`, where `der_bytes` is of type `base::span<uint8_t>`.
The rewriter has failed to add `.data()` to `der_bytes` to get the underlying pointer.

## Solution
The rewriter should add `.data()` when a spanified return value is being used as a pointer.
```c++
         CBB_finish(cbb.get(), &der_bytes.data(), &der_bytes_len));
```

## Note
The second error appears at `std::vector<uint8_t> der_bytes_vec(der_bytes.data(), der_bytes.subspan(der_bytes_len).data());`. In this case the `.data()` call has been generated, but the `.subspan()` call is generating a similar error. A later step in the rewriter should recognize that a spanified variable is having subspan called on it, and also add `.data()` to the result.
```c++
        std::vector<uint8_t> der_bytes_vec(der_bytes.data(),
                                            der_bytes.subspan(der_bytes_len).data());
```
There should be an additional `.data()` added after `der_bytes.subspan(der_bytes_len)`:
```c++
        std::vector<uint8_t> der_bytes_vec(der_bytes.data(),
                                            der_bytes.subspan(der_bytes_len).data().data());
```
This can be categorized as Rewriter failed to apply subspan rewrite to a spanified return value. because subspan returns a span and then .data() is being called on it, and the subspan didn't have .data() called on it first.