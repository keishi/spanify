# Build Failure Analysis: 2025_05_02_patch_1700

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9429:38: error: out-of-line definition of 'CheckTransformFeedback' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9429 | ALWAYS_INLINE bool GLES2DecoderImpl::CheckTransformFeedback(
      |                                      ^~~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:538:7: note: GLES2DecoderImpl defined here
  538 | class GLES2DecoderImpl : public GLES2Decoder,
      |       ^~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `CheckTransformFeedback` is defined out-of-line, and the spanification of the `counts` parameter changed the function signature in the implementation file (`gles2_cmd_decoder.cc`) but not in the class definition (likely in a header file). This mismatch in function signatures leads to a compilation error because the compiler cannot find a matching function declaration for the out-of-line definition. The rewriter failed to spanify the declaration of `CheckTransformFeedback`.

## Solution
The rewriter needs to ensure that when a function parameter is spanified, the corresponding function declaration (in the header file or class definition) is also updated with the new `base::span` type. Need to rewrite the declaration of `CheckTransformFeedback` in the header file.

## Note
There are other errors with `DoMultiDrawArrays` and `DoMultiDrawElements`, and these will likely be solved when the root cause of this bug is fixed.