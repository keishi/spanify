# Build Failure Analysis: 2025_03_14_patch_1502

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2694:40: error: no viable conversion from 'const volatile GLint *' (aka 'const volatile int *') to 'base::span<const volatile GLint>' (aka 'span<const volatile int>').

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoSamplerParameteriv`, but `gles2_cmd_decoder_autogen.h` is generated code and is therefore excluded from rewriting. The function `DoSamplerParameteriv` is called within `gles2_cmd_decoder_autogen.h`, and it is passed `const volatile GLint* params`. This is not compatible with the spanified declaration of the function, causing the build error.

## Solution
The rewriter should avoid spanifying functions if it leads to rewriting generated code.

## Note
There were other errors, but they are all the same.