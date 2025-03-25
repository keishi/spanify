# Build Failure Analysis: 2025_03_19_patch_1506

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:2694:40: error: no viable conversion from 'const volatile GLint *' (aka 'const volatile int *') to 'base::span<const volatile GLint>' (aka 'span<const volatile int>')
 2694 |   DoSamplerParameteriv(sampler, pname, params);
      |                                        ^~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DoSamplerParameteriv` in `gles2_cmd_decoder.cc` was spanified.
However, it is being called from `gles2_cmd_decoder_autogen.h`, which is generated code and thus should be excluded from the rewriter.
The rewriter should not attempt to spanify code that requires modification of generated code.

## Solution
Remove the spanification of the `DoSamplerParameteriv` function.

## Note
The error message indicates a type conversion issue between `const volatile GLint*` and `base::span<const volatile GLint>`. The `gles2_cmd_decoder_autogen.h` file is automatically generated, implying that manual changes to this file will be overwritten.