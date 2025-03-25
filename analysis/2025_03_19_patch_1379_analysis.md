# Build Failure Analysis: 2025_03_19_patch_1379

## First error

../../gpu/command_buffer/service/shared_image/gl_repack_utils.cc:31:29: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified `src_data`, but failed to generate the correct code. `src_pixmap.addr()` returns a raw pointer `const void*`, which was then cast to `const uint8_t*`.

The rewriter needs to be able to create a span from the raw pointer return of `src_pixmap.addr()`.

## Solution
The rewriter needs to recognize the pattern where a raw pointer is passed to the span constructor. It should determine the size information is unavailable rhs, and avoid spanifying the code.

## Note
The error message indicates that there's no implicit conversion from `const uint8_t *` to `base::span<const uint8_t>`.