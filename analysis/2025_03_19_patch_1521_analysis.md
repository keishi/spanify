```
# Build Failure Analysis: 2025_03_19_patch_1521

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9428:38: error: out-of-line definition of 'CheckTransformFeedback' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `CheckTransformFeedback` and `DoMultiDrawArrays` function, but these function declarations reside in `gles2_cmd_decoder.h` which is a generated file. Generated files are excluded from the rewriter, so the rewriter shouldn't spanify functions that require rewriting excluded code. The following error messages confirm this.

```
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9428:38: error: out-of-line definition of 'CheckTransformFeedback' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9428 | ALWAYS_INLINE bool GLES2DecoderImpl::CheckTransformFeedback(
      |                                      ^~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9470:46: error: out-of-line definition of 'DoMultiDrawArrays' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9470 | ALWAYS_INLINE error::Error GLES2DecoderImpl::DoMultiDrawArrays(
      |                                              ^~~~~~~~~~~~~~~~~
```

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
There is another error in the log.
```
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9517:65: error: no viable conversion from 'base::span<const GLsizei>' (aka 'span<const int>') to 'const GLsizei *' (aka 'const int *')
 9517 |     if (!CheckTransformFeedback(function_name, instanced, mode, counts,
      |                                                                 ^~~~~~
```
This indicates that the rewriter is not spanifying a function call site after spanifying the function declaration. This is another error.