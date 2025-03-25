```
# Build Failure Analysis: 2025_03_19_patch_1620

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9470:46: error: out-of-line definition of 'DoMultiDrawArrays' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'
 9470 | ALWAYS_INLINE error::Error GLES2DecoderImpl::DoMultiDrawArrays(
      |                                              ^~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize out-of-line function definitions after spanification.

## Reason
The rewriter spanified a function declaration but failed to update the corresponding out-of-line definition. The build system is set up in a way that this results in a hard error.

## Solution
The rewriter needs to spanify the out-of-line definition as well. Rewriter should generate code like this:

```c++
ALWAYS_INLINE error::Error GLES2DecoderImpl::DoMultiDrawArrays(
    const char* function_name,
    bool instanced,
    GLenum mode,
    base::span<const GLint> firsts,
    const GLsizei* counts,
    const GLsizei* primcounts,
    const GLuint* baseinstances,
    const GLsizei drawcount) 
```

## Note
The remaining errors all stem from the failure to spanify the function declaration. The other errors are all about how the generated span type is not compatible with the raw GLint* argument in the call to the un-spanified function.