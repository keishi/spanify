# Build Failure Analysis: 2025_03_19_patch_1840

## First error

../../gpu/command_buffer/tests/gl_readback_unittest.cc:85:29: error: no viable conversion from 'unsigned char *' to 'base::span<unsigned char>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified a local variable `data`, but failed to use `make_span` to construct the span from the raw pointer returned by `glMapBufferCHROMIUM`. The `base::span` constructor is explicit, and it doesn't implicitly convert from a raw pointer to a span. This is a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should generate code to explicitly construct the span using `base::make_span` with a suitable size or allow list the raw pointer. Since `glMapBufferCHROMIUM` does not provide a size, add `.data()` and raw pointer exclusion for the method.

For example:

```c++
// Old:
base::span<unsigned char> data =
    static_cast<unsigned char*>(glMapBufferCHROMIUM(
        GL_PIXEL_PACK_TRANSFER_BUFFER_CHROMIUM, GL_READ_ONLY));

// New:
unsigned char *data =
    static_cast<unsigned char*>(glMapBufferCHROMIUM(
        GL_PIXEL_PACK_TRANSFER_BUFFER_CHROMIUM, GL_READ_ONLY));
```

## Note
The fix is complicated. We need to exclude `glMapBufferCHROMIUM` from spanification or rewrite how the span is constructed at the call site. For now, revert the change.