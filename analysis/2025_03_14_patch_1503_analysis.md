# Build Failure Analysis: 2025_03_14_patch_1503

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:2646:40: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')"

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is trying to spanify `DoSamplerParameterfv`, however the function is called from `gles2_cmd_decoder_autogen.h` which is generated code and is excluded from rewriting. The rewriter cannot find the size of the parameter `params`, so it cannot construct the span.

## Solution
The rewriter should not try to rewrite functions that are called from generated code.

## Note
The rewriter should not rewrite functions that are called from generated code.