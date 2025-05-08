# Build Failure Analysis: 2025_05_02_patch_84

## First error

../../net/websockets/websocket_basic_stream_test.cc:247:17: error: no viable conversion from 'base::span<const char>' to 'const char *'
  247 |     const char* start = data;
      |                 ^       ~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the `data` parameter, but the code still tries to assign it to `const char* start`. This is not a valid conversion.

## Solution
The rewriter needs to avoid spanifying `data` if it is assigned to a `const char*`.

## Note
There are more errors related to the same root cause, and a `reinterpret_cast` error that should be classified separately.
```
../../net/websockets/websocket_basic_stream_test.cc:253:62: error: invalid operands to binary expression ('size_t' (aka 'unsigned long') and 'const char *')
  253 |               base::span<const char>(data).subspan(data_size - start)) < len) {
      |                                                    ~~~~~~~~~ ^ ~~~~~
../../net/websockets/websocket_basic_stream_test.cc:255:60: error: invalid operands to binary expression ('size_t' (aka 'unsigned long') and 'const char *')
  255 |             base::span<const char>(data).subspan(data_size - start));
      |                                                  ~~~~~~~~~ ^ ~~~~~
../../net/websockets/websocket_basic_stream_test.cc:1006:28: error: reinterpret_cast from 'HeapArray<unsigned char>' to 'char *' is not allowed
 1006 |   CreateChunkedRead(ASYNC, reinterpret_cast<char*>(big_frame), big_frame.size(),
      |                            ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~