# Build Failure Analysis: 2025_05_02_patch_1707

## First error
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9716:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9716 | ALWAYS_INLINE error::Error GLES2DecoderImpl::DoMultiDrawElements(
      |                                              ^~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:538:7: note: GLES2DecoderImpl defined here
  538 | class GLES2DecoderImpl : public GLES2Decoder,
      |       ^~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoMultiDrawElements`, but it also needs to update its declaration inside `GLES2DecoderImpl`. However the class definition `GLES2DecoderImpl` is in `gpu/command_buffer/service/gles2_cmd_decoder.cc`, but the declaration of the function is in `gpu/command_buffer/service/gles2_cmd_decoder_autogen.h`, which is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should check if the spanified function is declared in excluded code, and if so, avoid spanifying it.

## Note
The other errors all stem from failing to spanify the declaration.