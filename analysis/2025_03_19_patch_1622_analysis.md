# Build Failure Analysis: 2025_03_19_patch_1622

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9715:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to spanify `DoMultiDrawElements`, but the signature for the definition did not match the signature in the header file. The header file `gpu/command_buffer/service/gles2_cmd_decoder_autogen.h` is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter needs to check whether the definition is also spanified. The rewriter should also avoid spanifying functions that are used in excluded files.

## Note
Several errors were generated due to the signature of DoMultiDrawElements being spanified, while the signature of the call site required a `GLsizei *` (aka `int *`).