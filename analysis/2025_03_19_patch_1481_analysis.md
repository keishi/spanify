# Build Failure Analysis: 2025_03_19_patch_1481

## First error
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:3165:47: error: no viable conversion from 'const char **' to 'base::span<const char *const>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified `GLES2DecoderImpl::DoTransformFeedbackVaryings`, but the generated code in `gles2_cmd_decoder_autogen.h` calls this function with `const char **varyings`. The compiler reports "no viable conversion from 'const char **' to 'base::span<const char *const>'".  The rewriter failed to recognize this size info unavailable rhs value. It is unable to convert the `const char**` to a `base::span` because it doesn't have the size information needed to construct the span.

## Solution
The rewriter needs to recognize the `const char**` being passed and either:
1.  Pass a `base::span` to the call site as well and ensure the value is available from the proper scope.
2.  Avoid spanifying functions when the argument to the function call was a `char**` where the size was unknown.
3.  Rewrite the calling method to use span and calculate the size.

## Note
There are additional similar errors in `gles2_cmd_decoder_autogen.h`. They are likely caused by similar rewrite problems in this area of code.