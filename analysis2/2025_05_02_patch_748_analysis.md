# Build Failure Analysis: 2025_05_02_patch_748

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8761:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed
8761 |                           const_cast<const GLfloat*>(value));
|                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code attempts to `const_cast` a `base::span<const volatile GLfloat>` to `const GLfloat*`. This is not allowed. The rewriter has spanified the `value` argument in the `DoUniform4fv` function, but the underlying implementation still uses a raw pointer and tries to cast the span back to a raw pointer, which is unsafe and unnecessary.

## Solution
Remove the `const_cast`. Instead, modify the code to work directly with the `base::span`. If the underlying implementation requires a raw pointer, use the `.data()` method of the span to obtain a raw pointer. However, make sure that this pointer is only used within the scope where the span is valid, and that the size information from the span is also used to prevent buffer overflows.

The following code:

```c++
void GLES2DecoderImpl::DoUniform4fv(GLint fake_location,
                                    GLsizei count,
                                    base::span<const volatile GLfloat> value) {
  GLenum type = 0;
  GLint real_location = -1;
  if (!PrepForSetUniformByLocation(fake_location, "glUniform4fv",
                                      &type, &real_location)) {
    return;
  }

  if (real_location == -1)
    return;

  if (type == GL_FLOAT_VEC4) {
    if (count > 1) {
      // On ES3+ it's legal to pass arrays of GL_FLOAT_VEC4 through
      // glUniform4fv, so we need to pass the array as such to
      // the driver.
      glUniform4fv(real_location, count,
                           const_cast<const GLfloat*>(value));
    } else {
      // On ES2 / WebGL1 it's illegal to pass single GL_FLOAT_VEC4s through
      // glUniform4fv, so we need to de-vectorize it.
      const GLfloat* v = value;
      glUniform4f(real_location, v[0], v[1], v[2], v[3]);
    }
  } else if (type == GL_FLOAT_MAT2) {
    //It's illegal to pass matrices through glUniform4fv, so we need to pass them
    //through glUniformMatrix2fv
    glUniformMatrix2fv(real_location, count, GL_FALSE,
                           const_cast<const GLfloat*>(value));
  } else if (type == GL_FLOAT_MAT3) {
    //It's illegal to pass matrices through glUniform4fv, so we need to pass them
    //through glUniformMatrix3fv
    glUniformMatrix3fv(real_location, count, GL_FALSE,
                           const_cast<const GLfloat*>(value));
  } else {
    NOTREACHED();
  }
}
```

should be changed to:

```c++
void GLES2DecoderImpl::DoUniform4fv(GLint fake_location,
                                    GLsizei count,
                                    base::span<const volatile GLfloat> value) {
  GLenum type = 0;
  GLint real_location = -1;
  if (!PrepForSetUniformByLocation(fake_location, "glUniform4fv",
                                      &type, &real_location)) {
    return;
  }

  if (real_location == -1)
    return;

  if (type == GL_FLOAT_VEC4) {
    if (count > 1) {
      // On ES3+ it's legal to pass arrays of GL_FLOAT_VEC4 through
      // glUniform4fv, so we need to pass the array as such to
      // the driver.
      glUniform4fv(real_location, count, value.data());
    } else {
      // On ES2 / WebGL1 it's illegal to pass single GL_FLOAT_VEC4s through
      // glUniform4fv, so we need to de-vectorize it.
      const GLfloat* v = value.data();
      glUniform4f(real_location, v[0], v[1], v[2], v[3]);
    }
  } else if (type == GL_FLOAT_MAT2) {
    //It's illegal to pass matrices through glUniform4fv, so we need to pass them
    //through glUniformMatrix2fv
    glUniformMatrix2fv(real_location, count, GL_FALSE, value.data());
  } else if (type == GL_FLOAT_MAT3) {
    //It's illegal to pass matrices through glUniform4fv, so we need to pass them
    //through glUniformMatrix3fv
    glUniformMatrix3fv(real_location, count, GL_FALSE, value.data());
  } else {
    NOTREACHED();
  }
}
```

The second error comes from the call site:

```c++
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:3600:33: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
3600 |   DoUniform4fv(location, count, v);
|                                 ^
```

The rewriter changed the `DoUniform4fv` to take a span, but didn't update all call sites. The call site in `gles2_cmd_decoder_autogen.h` is passing a raw pointer (`v`) where a span is expected. The fix is to pass `v` as `base::span(v, 4)`.

The following code:

```c++
  GLfloat temp[4] = {
      x,
      y,
      z,
      w,
  };
  DoUniform4fv(location, 1, &temp[0]);
  return error::kNoError;
}
```

should be changed to:

```c++
  GLfloat temp[4] = {
      x,
      y,
      z,
      w,
  };
  DoUniform4fv(location, 1, base::span(temp, 4));
  return error::kNoError;
}
```
or

```c++
  GLfloat temp[4] = {
      x,
      y,
      z,
      w,
  };
  DoUniform4fv(location, 1, temp);
  return error::kNoError;
}
```

## Note
The rewriter should ideally handle the `.data()` conversion automatically when a span is passed to a function that expects a raw pointer. Alternatively, the rewriter should also spanify the call sites.