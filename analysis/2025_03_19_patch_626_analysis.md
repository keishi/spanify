# Build Failure Analysis: 2025_03_19_patch_626

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:1688:22: error: cannot initialize a parameter of type 'DeleteFn' (aka 'void (GLES2Implementation::*)(GLsizei, const GLuint *)') with an rvalue of type 'void (gpu::gles2::GLES2Implementation::*)(GLsizei, base::span<const GLuint>)': type mismatch at 2nd parameter ('const GLuint *' (aka 'const unsigned int *') vs 'base::span<const GLuint>' (aka 'span<const unsigned int>'))
 1688 |                      &GLES2Implementation::DeleteProgramStub)) {
      |                      ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `DeleteProgramStub` function. However, the code calls a function pointer and it's signature did not get updated to reflect the change from `GLuint*` to `base::span<const GLuint>`.

## Solution
The rewriter needs to update all the call sites of a spanified function. The tool missed this one. This can be fixed by updating the signature of the `DeleteFn` typedef.

## Note
`DeleteFn` is a typedef declared in `gpu/command_buffer/client/share_group.h`:
```c++
  using TextureDeleter = void(GLuint);
  using BufferDeleter = void(GLuint);
  using RenderbufferDeleter = void(GLuint);
  using ProgramDeleter = void(GLuint);
  using ShaderDeleter = void(GLuint);
  using SamplerDeleter = void(GLuint);
  using SyncDeleter = void(GLuint);

  using DeleteFn = void(GLsizei n, const GLuint* ids);