# Build Failure Analysis: 2025_03_19_patch_1495

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1257:39: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GenTransformFeedbacksHelper` was spanified, but the call site in `GLES2DecoderImpl::DoGenTransformFeedbacks` passes a raw pointer (`ids_safe`) to it. The size of `ids_safe` is available from `n`, so the rewriter should be able to generate a span from it.

```c++
  return DoGenTransformFeedbacks(n, reinterpret_cast<const GLuint*>(ids));
}

error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
```

## Solution
The rewriter should recognize that the raw pointer is being passed to a spanified function. It should then use the available size information to create a temporary span.

## Note
This is an instance of issue #21 "Rewriter failing to recognize raw pointer passed to spanified function."