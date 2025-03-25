# Build Failure Analysis: 2025_03_19_patch_1510

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8714:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the `value` argument in `GLES2DecoderImpl::DoUniform2fv`, but the code inside the function still uses `const_cast` on it. This is not allowed.

## Solution
The rewriter needs to remove the `const_cast` from the code. If necessary the rewriter needs to rewrite the function to correctly work with a span.

## Note
The second error is 

```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:3330:33: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
 3330 |   DoUniform2fv(location, count, v);
```

This is a Pointer passed into spanified function parameter. The rewriter spanified a function, but failed to spanify a call site.