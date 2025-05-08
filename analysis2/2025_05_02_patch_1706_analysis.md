# Build Failure Analysis: 2025_05_02_patch_1706

## First error
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9716:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9716 | ALWAYS_INLINE error::Error GLES2DecoderImpl::DoMultiDrawElements(
      |                                              ^~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter changed the function signature of `DoMultiDrawElements` to take a `base::span<const int32_t> offsets` instead of `const int32_t* offsets`. However, the declaration of the function in the class definition was not updated, leading to a mismatch between the declaration and the definition. This also means that the call sites inside `HandleDrawElements`, `HandleDrawElementsInstancedANGLE` and `HandleDrawElementsInstancedBaseVertexBaseInstanceANGLE` were not updated to use span.

## Solution
The rewriter needs to update the function declaration in the class definition to match the new function signature. The code should be changed to:

```c++
class GLES2DecoderImpl : public GLES2Decoder,
                           public ClearTextureLevelParamsTransferCache::Client {
 public:
  ...
  error::Error DoMultiDrawElements(const char* function_name,
                                   bool instanced,
                                   GLenum mode,
                                   const GLsizei* counts,
                                   GLenum type,
                                   base::span<const int32_t> offsets,
                                   const GLsizei* primcounts,
                                   const GLint* basevertices,
                                   const GLuint* baseinstances,
                                   GLsizei drawcount) {
```