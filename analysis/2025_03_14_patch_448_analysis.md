# Build Failure Analysis: 2025_03_14_patch_448

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:803:27: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
  803 |   DeleteSamplersHelper(n, samplers);
      |                           ^~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteSamplersHelper` was spanified. However, the call site in `gles2_cmd_decoder_autogen.h` passes a raw pointer to the function. This header is auto-generated, so it shouldn't be spanified (or touched at all). The rewriter should avoid spanifying the function `DeleteSamplersHelper` altogether to avoid needing to rewrite generated code.

## Solution
Prevent the rewriter from spanifying functions that have call sites in excluded code. If a function has any calls from excluded code, then that function should not be spanified.

## Note
This is a case of Pointer passed into spanified function parameter, but the root cause is because of spanifying excluded code.