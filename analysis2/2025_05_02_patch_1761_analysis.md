# Build Failure Analysis: 2025_05_02_patch_1761

## First error

../../gpu/command_buffer/client/gles2_implementation_autogen.h:943:53: error: non-virtual member function marked 'override' hides virtual member function

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GetProgramResourceiv` was spanified, but the rewriter failed to spanify the base class.
gles2_implementation_autogen.h implements GetProgramResourceiv:
```c++
virtual void GetProgramResourceiv(GLuint program,
                          const GLenum* props,
                          GLsizei bufsize,
                          GLsizei* length,
                          base::span<GLint> params) override;
```

But gles2_interface_autogen.h is not spanified:
```c++
virtual void GetProgramResourceiv(GLuint program,
                                  const GLenum* props,
                                  GLsizei bufsize,
                                  GLsizei* length,
                                  GLint* params) override;
```

The signatures between the base class and derived class needs to match for the override to work.

## Solution
Need to spanify the base class.

```c++
virtual void GetProgramResourceiv(GLuint program,
                                  const GLenum* props,
                                  GLsizei bufsize,
                                  GLsizei* length,
                                  base::span<GLint> params) override;
```

## Note
None