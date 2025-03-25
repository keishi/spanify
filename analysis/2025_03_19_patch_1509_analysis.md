# Build Failure Analysis: 2025_03_19_patch_1509

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8691:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed
 8691 |                           const_cast<const GLfloat*>(value));
      |                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter replaced `const volatile GLfloat* value` with `base::span<const volatile GLfloat> value`.  However, the code contains a `const_cast<const GLfloat*>(value)` which is no longer valid. The rewriter should have removed the `const_cast`.

## Solution
The rewriter needs to be updated to remove the `const_cast` when it spanifies the `value` parameter in `GLES2DecoderImpl::DoUniform1fv`.

## Note
The second error is a fallout from the first error. It will be addressed with the first error is fixed.