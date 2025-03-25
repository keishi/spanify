# Build Failure Analysis: 2025_03_19_patch_1276

## First error

../../services/network/tls_client_socket_unittest.cc:581:17: error: no matching function for call to 'byte_span_from_cstring'

## Category
Rewriter needs to add .data() to spanified `char[]` variable used with `std::string`.

## Reason
The rewriter has converted a `char[]` variable `kSecretMsg` to `std::string_view`. However, the `base::byte_span_from_cstring` function expects a C-style string (i.e., a `char[]` or `const char*`) as input, not a `std::string_view`. The fix is to call `.data()` on `kSecretMsg` so it can interoperate with `base::byte_span_from_cstring`.

## Solution
Add `.data()` to the `kSecretMsg` variable when calling `base::byte_span_from_cstring`.

For example, change:

```
base::byte_span_from_cstring(kSecretMsg)
```

to:

```
base::byte_span_from_cstring(kSecretMsg.data())
```

## Note
This error happens multiple times in the file. All occurrences need to be fixed.