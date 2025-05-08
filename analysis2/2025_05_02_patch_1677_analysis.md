# Build Failure Analysis: 2025_05_02_patch_1677

## First error

```
../../gpu/command_buffer/client/gles2_implementation_autogen.h:310:41: error: non-virtual member function marked 'override' hides virtual member function
  310 |                          GLint* params) override;
      |                                         ^
../../gpu/command_buffer/client/gles2_interface_autogen.h:227:14: note: hidden overloaded virtual function 'gpu::gles2::GLES2Interface::GetActiveUniformsiv' declared here: type mismatch at 3rd parameter ('const GLuint *' (aka 'const unsigned int *') vs 'base::span<const GLuint>' (aka 'span<const unsigned int>'))
  227 | virtual void GetActiveUniformsiv(GLuint program,
      |              ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `GetActiveUniformsiv` function, but failed to update the virtual function declaration in `gles2_interface_autogen.h`. The virtual function still expects a `const GLuint* indices`, while the overriding function now expects a `base::span<const GLuint> indices`.  This mismatch causes the "hides virtual member function" error.

## Solution
The rewriter needs to update the virtual function declaration in `gles2_interface_autogen.h` to also use `base::span<const GLuint> indices`. The corrected declaration should be:

```c++
virtual void GetActiveUniformsiv(GLuint program,
                         GLsizei count,
                         base::span<const GLuint> indices,
                         GLenum pname,
                         GLint* params) override;
```

## Note
The rewriter also spanified the same function in `gles2_interface_stub_autogen.h`, `gles2_interface_stub_impl_autogen.h`, and `gles2_trace_implementation_autogen.h`, so we need to ensure that the rewriter is updating the function declaration in each of those header files.