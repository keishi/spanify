# Build Failure Analysis: 2025_03_14_patch_310

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16354:38: error: no viable conversion from 'std::array<GLenum, 16>' (aka 'array<unsigned int, 16>') to 'const GLenum *' (aka 'const unsigned int *')
 16354 |     api()->glDrawBuffersARBFn(count, safe_bufs);
       |                                      ^~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `GLenum safe_bufs[16]` to `std::array<GLenum, 16> safe_bufs;` in `GLES2DecoderImpl::DoDrawBuffersEXT`.  However, the `glDrawBuffersARBFn` function expects a `const GLenum*`. The rewriter did not add `.data()` to the `safe_bufs` argument when calling `glDrawBuffersARBFn`. This is considered a call to a third_party function even though it is a virtual function on a class. The generated code should be `api()->glDrawBuffersARBFn(count, safe_bufs.data());`

## Solution
The rewriter should add `.data()` when calling a third-party function with a spanified variable that was originally a C-style array. In this particular case, it should modify `GLES2CmdDecoderImpl::DoDrawBuffersEXT` to pass `safe_bufs.data()` instead of `safe_bufs` to `api()->glDrawBuffersARBFn`.

## Note
The overlapping replacements categories do not apply here since there are no overlapping edits shown in the error messages. The category "Rewriter needs to generate code to construct a span from the return value of a third_party function" also does not apply here because we are not handling return values.