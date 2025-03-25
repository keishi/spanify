# Build Failure Analysis: 2025_03_19_patch_1489

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:781:32: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
  781 |   DeleteRenderbuffersHelper(n, renderbuffers);

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteRenderbuffersHelper` in `gles2_cmd_decoder.cc` was spanified. However, it's being called from `gles2_cmd_decoder_autogen.h`, which is generated code and therefore excluded from spanification. The rewriter incorrectly modified the signature of `DeleteRenderbuffersHelper` to take a `base::span`, which is incompatible with the raw pointer being passed from the generated code.

## Solution
The rewriter needs to avoid spanifying functions that will be called from code that is excluded from spanification. One way to prevent this is to not spanify functions that are called in generated code. This could be accomplished by checking the call sites of a function before spanifying it, and skipping spanification if any call sites are in excluded code.

## Note
The rewriter should not be modifying code in `*_autogen.h` files since those files are automatically generated.