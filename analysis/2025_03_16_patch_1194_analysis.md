# Build Failure Analysis: 2025_03_16_patch_1194

## First error

../../components/pwg_encoder/pwg_encoder.cc:229:9: error: reinterpret_cast from 'base::span<const uint8_t>' (aka 'span<const unsigned char>') to 'const uint32_t *' (aka 'const unsigned int *') is not allowed

## Category
Rewriter is producing invalid reinterpret_cast from span to pointer.

## Reason
The rewriter changed `uint8_t*` to `base::span<uint8_t>`, and then the code used `reinterpret_cast` to cast the `span` to `uint32_t*`. This is an invalid cast, as the rewriter should have used `.data()` to get a pointer to the underlying buffer.
```c++
-   const uint32_t* pos = reinterpret_cast<const uint32_t*>(current_row);
+   const uint32_t* pos = reinterpret_cast<const uint32_t*>(current_row.data());
```

## Solution
The rewriter should insert `.data()` when casting a span to a pointer type.

## Note
There are multiple other errors in the build log. Also the other function signature should be updated as well.
```c++
-const uint8_t* GetRow(const BitmapImage& image, int row, bool flipy) {
+const base::span<uint8_t> GetRow(const BitmapImage& image,
+                                 int row,
+                                 bool flipy) {