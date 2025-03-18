# Build Failure Analysis: 2025_03_14_patch_1762

## First error

../../crypto/hmac_unittest.cc:162:22: error: no matching member function for call to 'Init'

## Category
Pointer passed into spanified function parameter.

## Reason
The `HMAC::Init` function was modified to accept a `base::span` argument, but the call site in `HMAC_unittest.cc` was not updated to pass a `base::span`. Instead, it is passing a raw pointer, `cases[i].key`, which is not implicitly convertible to `base::span`.

## Solution
The rewriter must also modify the call sites of spanified functions to construct a `base::span` from the arguments.

In this specific case, the rewriter should convert this:

```c++
hmac.Init(reinterpret_cast<const unsigned char*>(cases[i].key), ...);
```

to something like this:

```c++
hmac.Init(base::span(reinterpret_cast<const unsigned char*>(cases[i].key), ...), ...);
```

## Note

1.  The code `key_.assign(key, key + key_length);` in hmac.cc is not span-safe. This should be rewritten using `std::copy` and iterators, or by constructing a span.
2.  There are multiple errors in hmac_unittest.cc
3.  There is an attempt to call `.size()` on `kKnownSecretKey`, but `kKnownSecretKey` is actually an array not an object so the call fails. The corrected code is:

```c++
  static const size_t kKnownSecretKeySize =
      (kKnownSecretKey.size() * sizeof(decltype(kKnownSecretKey)::value_type));