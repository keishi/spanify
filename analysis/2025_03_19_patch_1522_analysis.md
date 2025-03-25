# Build Failure Analysis: 2025_03_19_patch_1522

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9428:38: error: out-of-line definition of 'CheckTransformFeedback' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to spanify `CheckTransformFeedback` but introduced an error because the signature in the header file `gpu/command_buffer/service/gles2_cmd_decoder.h` doesn't match. This header file is generated code, and is thus excluded from rewriting. Therefore the rewriter should not have spanified this function.

## Solution
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
The remaining errors are related to the same root cause.