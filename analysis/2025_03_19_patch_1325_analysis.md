# Build Failure Analysis: 1

## First error

../../chrome/browser/apps/icon_standardizer_unittest.cc:33:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code attempts to initialize a `base::span<uint8_t>` with the result of `reinterpret_cast<uint8_t*>(first_bitmap.getPixels())`. However, after the change `first_bitmap.getPixels()` returns `uint8_t *` so `reinterpret_cast` is not needed. The rewriter does not remove it after spanifying a variable and the resulting code fails to compile.

## Solution
The rewriter needs to remove the `reinterpret_cast` since the span is compatible with the return type of the expression.
```c++
-  base::span<uint8_t> first_data =
-      reinterpret_cast<uint8_t*>(first_bitmap.getPixels());
+  base::span<uint8_t> first_data = first_bitmap.getPixels();