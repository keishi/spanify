# Build Failure Analysis: 2025_03_14_patch_302

## First error

../../third_party/blink/renderer/core/inspector/v8_inspector_string.h:80:60: error: invalid operands to binary expression ('const base::span<uint8_t>' (aka 'const span<unsigned char>') and 'size_t' (aka 'unsigned long'))

## Category
Rewriter needs to use .data() to get a pointer from the span before doing pointer arithmetic.

## Reason
The rewriter changed `uint8_t* data()` to `base::span<uint8_t> data()`. The expression `data() + size()` now tries to add an integer to the span itself, which is not a valid operation. It needs to call data().data() first to get the pointer, and then add size to that pointer.

## Solution
The code needs to be changed to `data().data() + size()`. The rewriter needs to make this change.

## Note
There are more errors of the same kind in this file.