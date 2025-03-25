# Build Failure Analysis: 2025_03_19_patch_1621

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9470:46: error: out-of-line definition of 'DoMultiDrawArrays' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The first error indicates that the definition of `DoMultiDrawArrays` outside the class declaration doesn't match its declaration within the `GLES2DecoderImpl` class. This likely occurs because the rewriter modified the function signature within the class (by introducing `base::span`) but didn't update the out-of-line definition.

The signature of DoMultiDrawArrays is dependent on code in gles2_cmd_decoder_autogen.h, where `DrawArraysOption` is defined. Since gles2_cmd_decoder_autogen.h is generated code and is thus excluded from rewriting, we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should avoid spanifying `DoMultiDrawArrays` because it depends on a type defined in generated code (gles2_cmd_decoder_autogen.h) which cannot be rewritten.

## Note
Several other errors stem from the initial signature mismatch, indicating that other function calls are now incompatible with the modified `DoMultiDrawArrays` signature:

*   `no matching conversion for functional-style cast from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint, 1>'`
*   `no matching member function for call to 'DoMultiDrawArrays'`