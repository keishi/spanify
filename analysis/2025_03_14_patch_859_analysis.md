# Build Failure Analysis: 2025_03_14_patch_859

## First error

../../components/openscreen_platform/tls_connection_factory.cc:216:29: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to handle implicit conversion to base::span.

## Reason
Rewriter replaced `const uint8_t* data` with `base::span<const uint8_t> data`, but the span's constructor `base::span(const uint8_t*)` is explicit. An explicit cast or construction is needed.

## Solution
Rewriter needs to generate code to construct a base::span from the raw pointer, like this:
```c++
base::span<const uint8_t> data = base::span<const uint8_t>(CRYPTO_BUFFER_data(der_buffer), CRYPTO_BUFFER_len(der_buffer));
```
Or:
```c++
base::span<const uint8_t> data = {CRYPTO_BUFFER_data(der_buffer), CRYPTO_BUFFER_len(der_buffer)};
```

## Note
The second issue can be addressed by adding a `.data()` after a `.subspan()` call.
```c++
-     data.data(), data.subspan(CRYPTO_BUFFER_len(der_buffer)).data());
+     data.data(), data.subspan(CRYPTO_BUFFER_len(der_buffer)));