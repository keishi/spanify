```
# Build Failure Analysis: 2025_03_19_patch_166

## First error

../../base/files/memory_mapped_file_posix.cc:101:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter is spanifying code. However, in this case it has spanified the local variable assignment, but did not spanify the mmap function. This caused the compiler to complain that the returned raw pointer from `mmap` could not be converted to a span.

## Solution
The rewriter logic needs to be improved to deal with functions that return raw pointers. It can construct a temporary span, but this requires that we also have size information. This sounds similar to the size info unavailable problem.

## Note
There is a second error that says `error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'void *')`. This is because the first error prevented the code from compiling far enough to make it to the end of the function.