# Build Failure Analysis: 2025_05_02_patch_482

## First error
../../device/fido/rsa_public_key.cc:89:9: error: no matching function for call to 'CBB_finish'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The function `CBB_finish` expects a `uint8_t**` as an argument, but the rewriter is passing the address of a `base::span<uint8_t>`, which is a different type. The variable `der_bytes` was converted to a `base::span<uint8_t>`, but the `CBB_finish` function requires a `uint8_t**` to write the resulting pointer. The rewriter should have created a temporary `uint8_t*` variable, passed the address of the temporary variable to `CBB_finish`, and then assigned the resulting pointer to the span.

## Solution
The rewriter should generate code to create a temporary `uint8_t*` variable, pass the address of the temporary variable to `CBB_finish`, and then assign the resulting pointer and length to the span.

Here's an example of how the code should be changed:

```c++
  bssl::ScopedCBB cbb;
  uint8_t* der_bytes_ptr = nullptr;  // Temporary pointer
  size_t der_bytes_len = 0;
  CHECK(CBB_init(cbb.get(), /* initial size */ 128) &&
        EVP_marshal_public_key(cbb.get(), pkey.get()) &&
        CBB_finish(cbb.get(), &der_bytes_ptr, &der_bytes_len));

  base::span<uint8_t> der_bytes(der_bytes_ptr, der_bytes_len);

  std::vector<uint8_t> der_bytes_vec(der_bytes.data(),
                                     der_bytes.data() + der_bytes.size());
  OPENSSL_free(der_bytes_ptr);
```

## Note
The code also has an issue constructing the vector. It uses `der_bytes.subspan(der_bytes_len)`, however `der_bytes` already contains the length inside it. So it should have used `der_bytes.size()` instead.
```c++
  std::vector<uint8_t> der_bytes_vec(der_bytes.data(),
                                     der_bytes.data() + der_bytes.size());