# Build Failure Analysis: 2025_05_02_patch_1853

## First error

../../components/openscreen_platform/tls_connection_factory.cc:216:29: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  216 |   base::span<const uint8_t> data = CRYPTO_BUFFER_data(der_buffer);
      |                             ^      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `CRYPTO_BUFFER_data` returns a raw pointer (`const uint8_t*`). The rewriter attempted to directly assign this raw pointer to a `base::span<const uint8_t>`, which is not a valid conversion. The rewriter needs to create a span from this pointer using the span constructor. The size of the buffer is known using `CRYPTO_BUFFER_len(der_buffer)`.

## Solution
The rewriter should generate code to construct a `base::span` from the raw pointer returned by `CRYPTO_BUFFER_data` and the length returned by `CRYPTO_BUFFER_len`. The corrected code would look like this:

```c++
base::span<const uint8_t> data(CRYPTO_BUFFER_data(der_buffer), CRYPTO_BUFFER_len(der_buffer));
```

## Note
The second use of `.data()` in `data.data(), data.subspan(CRYPTO_BUFFER_len(der_buffer)).data())` is completely wrong. It should have been removed as a part of generating the span.