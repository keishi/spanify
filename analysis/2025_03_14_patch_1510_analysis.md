```
# Build Failure Analysis: 133

## First error
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4064:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>').
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to spanify `DoVertexAttrib2fv`, but this function is called in `gles2_cmd_decoder_autogen.h`, which is generated code and thus should be excluded from rewriting. The error indicates that there is no viable conversion from `const volatile GLfloat *` to `base::span<const volatile GLfloat>`, indicating that the rewriter is trying to pass a raw pointer to the spanified function, but the compiler cannot implicitly convert it.

## Solution
The rewriter should not attempt to spanify functions that have callers in generated or otherwise excluded code. Add an exclusion to avoid spanifying functions if it requires spanifying excluded code.

## Note
This is similar to issue 127.