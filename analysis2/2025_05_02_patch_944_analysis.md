# Build Failure Analysis: 2025_05_02_patch_944

## First error

../../content/browser/media/capture/frame_test_util.cc:149:9: error: reinterpret_cast from 'base::span<uint32_t>' (aka 'span<unsigned int>') to 'uint8_t *' (aka 'unsigned char *') is not allowed
  149 |         reinterpret_cast<uint8_t*>(UNSAFE_SKBITMAP_GETADDR32(bitmap, 0, row)));
      |         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code is attempting to `reinterpret_cast` a `base::span<uint32_t>` to a `uint8_t*`. The `UNSAFE_SKBITMAP_GETADDR32` macro is returning a `base::span<uint32_t>` now because the rewriter rewrote `SkBitmap::getAddr32` to return a span. However, the code still has a `reinterpret_cast` that is applied to it which is an error. Rewriter needs to be able to remove it.

## Solution
The rewriter needs to be able to identify when a `reinterpret_cast` is being used on a spanified variable and remove it.

## Note
This is a new category, please add it.