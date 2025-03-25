# Build Failure Analysis: 2025_03_19_patch_1624

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9715:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter modified the `DoMultiDrawElements` function definition, which is defined out-of-line. However, the function signature in `gles2_cmd_decoder_autogen.h` was not updated to reflect the new `base::span` parameter, leading to a mismatch between the declaration and the definition. The file `gles2_cmd_decoder_autogen.h` contains generated code which is excluded from the span rewriter. Thus, functions that require rewriting excluded code should not be spanified.

## Solution
The rewriter should avoid modifying function signatures in files that are excluded from rewriting. The rewriter must first check if the target function is defined out-of-line, and if it is, ensure that both the definition and any in-class declarations are eligible for spanification before applying the change.

## Note
The additional errors in the log indicate that the same problem exists in the call sites `HandleDrawElements` and `HandleDrawElementsInstancedANGLE` because the function `DoMultiDrawElements` was not properly rewritten in the generated files.