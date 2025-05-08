# Build Failure Analysis: 2025_05_02_patch_1701

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9429:38: error: out-of-line definition of 'CheckTransformFeedback' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9429 | ALWAYS_INLINE bool GLES2DecoderImpl::CheckTransformFeedback(
      |                                      ^~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `CheckTransformFeedback` is defined out-of-line but not spanified. The header declaration is being spanified, but the actual definition is not. This leads to a mismatch between the function declaration (which now takes a `base::span`) and the function definition (which still takes a raw pointer).

## Solution
The rewriter must ensure that both the declaration and the definition of a function are spanified when a parameter is converted to `base::span`. The rewriter should change the function declaration to use span `base::span<const GLsizei> primcounts,`

## Note
The rest of the errors are consequences of failing to update the declaration of `CheckTransformFeedback` and `DoMultiDrawArrays`. The error says `no viable conversion from 'base::span<const GLsizei>' (aka 'span<const int>') to 'const GLsizei *' (aka 'const int *')` which confirms the root cause is the rewriter spanifying the header but not the definition.