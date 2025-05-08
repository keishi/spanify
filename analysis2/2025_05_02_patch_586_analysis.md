# Build Failure Analysis: 2025_05_02_patch_586

## First error

no viable conversion from 'char *' to 'base::span<char>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `WebSocketInflater::OutputBuffer::Read` was spanified, but the call site `output_buffer_.Read(&buffer->data()[num_bytes_copied], num_bytes_to_copy);` passes a raw pointer `&buffer->data()[num_bytes_copied]` where the size `num_bytes_to_copy` is available. This seems to be a bug with the rewriter where it failed to recognize a size info available rhs value.

## Solution
The rewriter needs to recognize that `&buffer->data()[num_bytes_copied]` is a raw pointer, and `num_bytes_to_copy` is the size, so it should emit a span. Thus the rewriter should rewrite the code to: `output_buffer_.Read(base::span(&buffer->data()[num_bytes_copied], num_bytes_to_copy), num_bytes_to_copy);`

## Note
None