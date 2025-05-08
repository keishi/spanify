# Build Failure Analysis: 2025_05_02_patch_1039

## First error

../../device/fido/virtual_fido_device.cc:77:9: error: no matching function for call to 'CBB_finish'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The `CBB_finish` function expects a `uint8_t**` as its second argument, but the rewriter is passing `&der` where `der` is now a `base::span<uint8_t>`. The function likely assigns a new value to the variable. This variable cannot be rewritten by the rewriter today.

## Solution
The rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.

```c++
  uint8_t* der_ptr = nullptr;
  size_t der_len = 0;
  bssl::ScopedCBB cbb;
  CHECK(CBB_init(cbb.get(), 0) &&
        function(cbb.get(), std::forward<Args>(args)...) &&
        CBB_finish(cbb.get(), &der_ptr, &der_len));
  base::span<uint8_t> der(der_ptr, der_len);
  std::vector<uint8_t> ret(der.data(), der.subspan(der_len).data());
  OPENSSL_free(der_ptr);
```

## Note
The code also has another error related to `OPENSSL_free(der.data());`. It should be `OPENSSL_free(der_ptr);`
```