# Build Failure Analysis: 2025_03_19_patch_1623

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:11356:12: error: no viable overloaded '='
 11356 |     pixels = reinterpret_cast<uint8_t *>(pixels_shm_offset);
       |     ~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The rewriter changed `uint8_t* pixels` to `base::span<uint8_t> pixels`. Then in line 11356, it attempts to assign a raw pointer to the span. There is no implicit conversion from `uint8_t*` to `base::span<uint8_t>`. Similar errors happen again in line 11363.

## Solution
The rewriter should not blindly spanify every `uint8_t*`. In this case the rewriter should recognize that a raw pointer is being assigned to it, and skip the spanification.

## Note
More errors in this patch:
1.  `pixels = pixels.subspan(padded_row_size * () height - 1);` height - 1 should be inside parentheses.
2.  `api()->glReadPixelsFn(x, iy, width, 1, format, type, pixels);` The function `glReadPixelsFn` is expecting a `void*`, but `pixels` was changed to be `base::span<uint8_t>`. When that happens the rewriter should add `.data()` to the variable.