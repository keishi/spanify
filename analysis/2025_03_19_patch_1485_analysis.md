# Build Failure Analysis: 1485

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:739:26: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
  739 |   DeleteBuffersHelper(n, buffers);
      |                          ^~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to pass a `const volatile GLuint*` to a spanified function `DeleteBuffersHelper`, however the location where this is happening is in the auto-generated code: `gles2_cmd_decoder_autogen.h`. Because this header is auto-generated, it is implicitly excluded from spanification, and this creates an incompatibility between a spanified function and a non-spanified call site.

## Solution
The rewriter should not spanify functions if it requires spanifying excluded code. It needs to take auto-generated files into consideration when spanifying a function so it doesn't call the spanified function from a location that was skipped during spanification.

## Note
There are many potential solutions such as marking the function as `skip` if it requires rewriting code from excluded locations.