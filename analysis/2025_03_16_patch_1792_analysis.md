# Build Failure Analysis: 2025_03_16_patch_1792

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:760:31: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to convert `DeleteFramebuffersHelper` to take a `base::span`. However, the call site in `gles2_cmd_decoder_autogen.h` is in generated code, so it is excluded from spanification. The rewriter should not attempt to spanify a function if it requires modifying excluded code. The error message indicates that there's no viable conversion from `const volatile GLuint*` to `base::span<const volatile GLuint>`. This is because the auto-generated code was not updated to use `base::span`.

## Solution
The rewriter should check if all call sites of a function can be rewritten before spanifying it. If any call sites are in excluded code, the function should not be spanified.

## Note
The other error `/third_party/blink/renderer/modules/webaudio/webaudio/oscillator_kernel_sse2.o` is likely unrelated.