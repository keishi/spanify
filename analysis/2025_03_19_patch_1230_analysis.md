# Build Failure Analysis: 2025_03_19_patch_1230

## First error

../../content/renderer/skia_benchmarking_extension.cc:230:24: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  230 |   base::span<uint32_t> packed_pixels =
      |                        ^
  231 |       reinterpret_cast<uint32_t*>(bitmap.getPixels());

## Category
Rewriter needs to construct a span from the result of a reinterpret_cast.

## Reason
The code attempts to initialize a `base::span<uint32_t>` with the result of a `reinterpret_cast<uint32_t*>(bitmap.getPixels())`. However, `base::span` requires the size of the data to be known at construction. The rewriter does not provide the size information when it performs the rewrite.

## Solution
The rewriter needs to generate code to create a `base::span` from the raw pointer and the size of the buffer. The suggested way to create the span requires providing the size, so the rewriter needs to include the size in the code that it generates.

For example, the rewriter should perform the following replacement:

```c++
-  uint32_t* packed_pixels = reinterpret_cast<uint32_t*>(bitmap.getPixels());
+  base::span<uint32_t> packed_pixels =
+      base::span<uint32_t>(reinterpret_cast<uint32_t*>(bitmap.getPixels()), bitmap.computeByteSize() / sizeof(uint32_t));