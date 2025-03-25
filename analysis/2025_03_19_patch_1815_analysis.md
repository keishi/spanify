# Build Failure Analysis: 2025_03_19_patch_1815

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16354:38: error: no viable conversion from 'std::array<GLenum, 16>' (aka 'array<unsigned int, 16>') to 'const GLenum *' (aka 'const unsigned int *')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
In `GLES2DecoderImpl::DoDrawBuffersEXT`, the code converts a C-style array `safe_bufs` to `std::array`, but `api()->glDrawBuffersARBFn` is a third party function and requires a C-style array as input.  Because this is a third_party function call, the rewriter should have added `.data()` to the argument `safe_bufs`, but it did not.

## Solution
When converting a C-style array to `std::array`, the rewriter should add `.data()` when that variable is passed to a third_party function call.

## Note
The function `GLES2DecoderImpl::DoDrawBuffersEXT` is located in `gpu/command_buffer/service/gles2_cmd_decoder.cc`. The third party function `api()->glDrawBuffersARBFn` is defined in `ui/gl/gl_bindings_autogen_gl.h`.