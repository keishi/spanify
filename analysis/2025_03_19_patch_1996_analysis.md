# Build Failure Analysis: 2025_03_19_patch_1996

## First error

../../media/cdm/aes_decryptor_unittest.cc:248:24: error: no matching conversion for functional-style cast from 'const std::string_view' (aka 'const basic_string_view<char>') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  248 |                        base::span<const uint8_t>(kOriginalData)

## Category
Rewriter needs to convert string_view variable to span using data() and size().

## Reason
The code was trying to construct a `base::span<const uint8_t>` from a `std::string_view`.  The `base::span` constructor taking a `pointer` and `size` expects a `const unsigned char*` but was instead provided a `const char*`. This is because `kOriginalData` is now a `std::string_view` after the rewrite, and `.data()` returns a `const char*`. Additionally, when `std::string_view` is implicitly converted to `base::span`'s pointer type, size is also required.

## Solution
Change the constructor to use `.data()` and `.size()` to correctly pass in a C-style array and its size.

```
-      : original_data_(kOriginalData.data(),
-                       base::span<const uint8_t>(kOriginalData)
-                           .subspan(kOriginalDataSize)
-                           .data()),
+      : original_data_(reinterpret_cast<const uint8_t*>(kOriginalData.data()),
+                       kOriginalData.size()),
```

## Note
The reinterpret cast is necessary to convert from char to uint8_t. Also it may be better to pass `kOriginalDataSize` instead of `kOriginalData.size()`.

The safe_conversions.h error seems to indicate a missing template argument when calling subspan().