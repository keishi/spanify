# Build Failure Analysis: 2025_03_19_patch_1092

## First error

../../gpu/command_buffer/service/texture_manager.cc:1988:26: error: no viable conversion from 'std::array<GLuint, 2>' (aka 'array<unsigned int, 2>') to 'GLuint *' (aka 'unsigned int *')

## Category
Rewriter needs to avoid spanifying functions with array parameters if it requires rewriting call sites.

## Reason
The `glGenTextures` function in OpenGL expects a `GLuint*` as the second argument, but the rewriter changed `GLuint ids[2]` to `std::array<GLuint, 2> ids`, creating a type mismatch at the function call.  The rewriter should not have spanified the function if doing so would require rewriting excluded code or invalidating existing calling code.

## Solution
The rewriter should avoid spanifying the `glGenTextures` function to avoid changing the function signature. A better approach would be to detect that the function will cause a type mismatch at the call site and not rewrite at all.

## Note
The parameter `GLuint* textures` inside `glGenTexturesFn` was changed.
```diff
--- a/ui/gl/gl_bindings_autogen_gl.h
+++ b/ui/gl/gl_bindings_autogen_gl.h
@@ -2955,7 +2955,8 @@
   virtual void glGetTexLevelParameterivFn(GLenum target, GLint level, GLenum p
   virtual void glGetTexLevelParameterfvFn(GLenum target, GLint level, GLenum p
   virtual void glGetTexImageFn(GLenum target, GLint level, GLenum format, GLenum type, void* pixels) = 0;
-  virtual void glGenTexturesFn(GLsizei n, GLuint* textures) = 0;
+  virtual void glGenTexturesFn(GLsizei n, base::span<GLuint> textures) = 0;
+
   virtual void glDeleteTexturesFn(GLsizei n, const GLuint* textures) = 0;
   virtual void glBindTextureFn(GLenum target, GLuint texture) = 0;
   virtual void glCopyTexImage2DFn(GLenum target, GLint level, GLenum intern