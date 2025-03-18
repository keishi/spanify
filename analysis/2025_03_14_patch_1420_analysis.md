# Build Failure Analysis: 2025_03_14_patch_1420

## First error

../../gpu/command_buffer/tests/gl_readback_unittest.cc:85:29: error: no viable conversion from 'unsigned char *' to 'base::span<unsigned char>'

## Category
Rewriter needs to use make_span() to construct a `span` from a raw pointer.

## Reason
`glMapBufferCHROMIUM` returns a raw pointer, but the rewritten code is directly assigning it to a `base::span` variable. The rewriter should use `base::make_span` to properly construct the span from the raw pointer.

## Solution
The rewriter should wrap the raw pointer with `base::make_span` when assigning to a `base::span` variable.
```c++
base::span<unsigned char> data = base::make_span(static_cast<unsigned char*>(glMapBufferCHROMIUM(
          GL_PIXEL_PACK_TRANSFER_BUFFER_CHROMIUM, GL_READ_ONLY)), <#size#>));
```

## Note
The span requires a size. The size needs to be determined.