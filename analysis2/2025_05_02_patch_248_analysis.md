# Build Failure Analysis: 2025_05_02_patch_248

## First error

../../ui/gl/gl_stub_api.h:36:65: error: non-virtual member function marked 'override' hides virtual member function
   36 |   void glGenBuffersARBFn(GLsizei n, base::span<GLuint> buffers) override;
      |                                                                 ^
../../ui/gl/gl_stub_autogen_gl.h:449:6: note: hidden overloaded virtual function 'gl::GLStubApiBase::glGenBuffersARBFn' declared here: type mismatch at 2nd parameter ('GLuint *' (aka 'unsigned int *') vs 'base::span<GLuint>' (aka 'span<unsigned int>'))
  449 | void glGenBuffersARBFn(GLsizei n, GLuint* buffers) override {}
      |      ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter changed the signature of `GLStubApi::glGenBuffersARBFn` to accept a `base::span<GLuint>` instead of `GLuint*`. However, the corresponding virtual function `GLStubApiBase::glGenBuffersARBFn` still expects a `GLuint*`. This mismatch causes the "hides virtual member function" error, because the override is no longer a valid override.
The root cause of this is that the rewriter spanified the implementation but failed to update the virtual function definition or other call sites.

## Solution
The rewriter needs to spanify the virtual function definition `GLStubApiBase::glGenBuffersARBFn` as well to keep the signatures consistent.
The other functions also need to be updated.

## Note
This error appears for several other functions as well (`glGenFencesNVFn`, `glGenFramebuffersEXTFn`, `glGenQueriesFn`, `glGenRenderbuffersEXTFn`, `glGenSamplersFn`, `glGenTexturesFn`, `glGenTransformFeedbacksFn`, `glGenVertexArraysOESFn`). The rewriter likely changed these functions in `GLStubApi` without updating the base class `GLStubApiBase`.