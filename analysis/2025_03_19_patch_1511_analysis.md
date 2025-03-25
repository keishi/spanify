# Build Failure Analysis: 2025_03_19_patch_1511

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8737:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed
 8737 |                           const_cast<const GLfloat*>(value));
      |                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the `value` parameter in `GLES2DecoderImpl::DoUniform3fv`, but a `const_cast` on that spanified variable was not removed.  Casting from a `span` to its underlying pointer via `const_cast` is not a valid use case because the span provides a safe and correct alternative for this pattern.

## Solution
The rewriter needs to remove the `const_cast` and use `value.data()` instead.

For example:
```diff
-                          const_cast<const GLfloat*>(value));
+                          value.data());
```

## Note
The second error occurs because the rewriter spanified a function, but failed to spanify a call site.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:3462:33: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
 3462 |   DoUniform3fv(location, count, v);
```
This is a `Pointer passed into spanified function parameter.` error.
```
Pointer passed into spanified function parameter.