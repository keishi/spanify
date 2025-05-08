# Build Failure Analysis: 2025_05_02_patch_466

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16409:38: error: no viable conversion from 'std::array<GLenum, 16>' (aka 'array<unsigned int, 16>') to 'const GLenum *' (aka 'const unsigned int *')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter has spanified `Framebuffer::SetDrawBuffers`, but has not updated the call site in `GLES2DecoderImpl::DoDrawBuffersEXT`. Specifically, `safe_bufs` is now an `std::array`, but `api()->glDrawBuffersARBFn` still expects a `const GLenum*`.

## Solution
The rewriter needs to update the call site to pass `safe_bufs.data()` to `api()->glDrawBuffersARBFn`.  The change should be made in the `GLES2DecoderImpl::DoDrawBuffersEXT` function to pass the underlying pointer of the `std::array`.
```cpp
     api()->glDrawBuffersARBFn(count, safe_bufs.data());
```

## Note
The root cause is that the rewriter only updated the function definition of `Framebuffer::SetDrawBuffers` but failed to update the callsite, leading to a type mismatch.