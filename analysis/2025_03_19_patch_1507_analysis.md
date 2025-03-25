# Build Failure Analysis: 2025_03_19_patch_1507

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2646:40: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoSamplerParameterfv`, but it is being called from `gles2_cmd_decoder_autogen.h` which is generated code, and thus excluded. We shouldn't spanify functions that require rewriting excluded code.

## Solution
Remove the spanification of `GLES2DecoderImpl::DoSamplerParameterfv`.

## Note
Here are other errors that would have happened if the first error was not present.

```
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:1894:1: error: redefinition of 'GLES2DecoderImpl::DoSamplerParameterfv'
void GLES2DecoderImpl::DoSamplerParameterfv(
^
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:1891:3: note: 'DoSamplerParameterfv' previously declared here
  void DoSamplerParameterfv(GLuint client_id,
  ^

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8379:1: error: redefinition of 'GLES2DecoderImpl::DoSamplerParameterfv'
void GLES2DecoderImpl::DoSamplerParameterfv(
^
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:1891:3: note: 'DoSamplerParameterfv' previously declared here
  void DoSamplerParameterfv(GLuint client_id,
  ^