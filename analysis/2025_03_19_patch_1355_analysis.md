# Build Failure Analysis: 2025_03_19_patch_1355

## First error

../../net/websockets/websocket_basic_stream_test.cc:245:17: error: no viable conversion from 'base::span<const char>' to 'const char *'
  245 |     const char* start = data;
      |                 ^       ~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The variable `data` was changed from `const char[]` to `base::span<const char>`, but the line `const char* start = data;` was not updated to `const char* start = data.data();`. The `base::span::data()` method returns a pointer to the underlying data.

## Solution
The rewriter should add `.data()` to the spanified return value so that it can be converted to the correct type `const char*`.

## Note
The build log also contains these errors:

*   Invalid operands to binary expression ('size_t' (aka 'unsigned long') and 'const char *')
*   reinterpret_cast from 'HeapArray<unsigned char>' to 'char *' is not allowed
*   [chromium-style] span construction from string literal is problematic