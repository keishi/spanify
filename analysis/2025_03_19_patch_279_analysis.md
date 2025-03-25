# Build Failure Analysis: 2025_03_19_patch_279

## First error
../../components/openscreen_platform/tls_connection_factory.cc:216:29: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code is trying to assign a raw pointer `CRYPTO_BUFFER_data(der_buffer)` to a `base::span<const uint8_t>`. This suggests the rewriter didn't properly understand how to convert the raw pointer to a span in this context. It likely means the rewriter failed to infer or obtain the size of the buffer from which the pointer originates. This is happening during the assignment to the `data` variable.

## Solution
The rewriter needs to be able to handle cases where a raw pointer, like `CRYPTO_BUFFER_data(der_buffer)`, is assigned to a span. It should infer the size from `CRYPTO_BUFFER_len(der_buffer)` and construct the span accordingly. The fix involves generating code that explicitly constructs the span with both the pointer and the size:

```c++
base::span<const uint8_t> data(CRYPTO_BUFFER_data(der_buffer), CRYPTO_BUFFER_len(der_buffer));
```

## Note
The secondary error seems to stem from the subspan usage `data.subspan(CRYPTO_BUFFER_len(der_buffer))`. This is invalid because `subspan()` expects an offset and optionally a length, but here it's being called with only a length.