# Build Failure Analysis: 2025_03_19_patch_844

## First error
```
../../ui/gl/gl_stub_api.h:36:65: error: non-virtual member function marked 'override' hides virtual member function
   36 |   void glGenBuffersARBFn(GLsizei n, base::span<GLuint> buffers) override;
      |                                                                 ^
../../ui/gl/gl_stub_autogen_gl.h:449:6: note: hidden overloaded virtual function 'gl::GLStubApiBase::glGenBuffersARBFn' declared here: type mismatch at 2nd parameter ('GLuint *' (aka 'unsigned int *') vs 'base::span<GLuint>' (aka 'span<unsigned int>'))
  449 | void glGenBuffersARBFn(GLsizei n, GLuint* buffers) override {}
      |      ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The virtual function `glGenBuffersARBFn` in `GLStubApiBase` takes a `GLuint*` as argument, while the override in `GLStubApi` after spanification takes a `base::span<GLuint>`. The call site inside `GLStubApi::glGenBuffersARBFn` was not updated to pass a span.

## Solution
The rewriter needs to spanify the call sites to the function in question, in this case, `GLStubApiBase::glGenBuffersARBFn`.

## Note
The build log indicates that this error also occurs for `glGenFencesNVFn`, `glGenFramebuffersEXTFn`, `glGenQueriesFn`, `glGenRenderbuffersEXTFn`, `glGenSamplersFn`, `glGenTexturesFn`, and `glGenVertexArraysOESFn`. The rewriter needs to ensure that it spanifies the signature of the override in `GLStubApiBase`.