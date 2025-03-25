# Build Failure Analysis: 2025_03_19_patch_1625

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9715:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error indicates a mismatch between the out-of-line definition of the function `DoMultiDrawElements` and its declaration in the class `GLES2DecoderImpl`. The diff shows that the rewriter has modified the signature of `DoMultiDrawElements` to include `base::span<const GLsizei> primcounts`. However, this function is defined in `gles2_cmd_decoder.cc`, and the corresponding declaration is inside `gles2_cmd_decoder_autogen.h`, which should be excluded from rewriting (because it is generated code). Since the declaration was not modified, the definition no longer matches the declaration.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying code that is excluded, such as generated code or third_party code. In this case, the rewriter should have skipped the function definition in `gles2_cmd_decoder.cc` since its declaration in `gles2_cmd_decoder_autogen.h` is excluded.

## Note
The subsequent errors stem from the same root cause: `DoMultiDrawElements` is being called with incorrect arguments because the rewriter changed its signature in some places but not others.