# Build Failure Analysis: 2025_03_19_patch_1627

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9715:46: error: out-of-line definition of 'DoMultiDrawElements' does not match any declaration in 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified a function, `DoMultiDrawElements`. This function is called in `HandleDrawElementsInstancedBaseVertexBaseInstanceANGLE`, which the rewriter also changed to use span: `base::span<GLuint, 1>(&baseinstance)`. However, `HandleDrawElementsInstancedBaseVertexBaseInstanceANGLE` is a member of the `GLES2DecoderImpl` class. This class inherits from `GLES2Decoder`, and this inheritance requires the declaration and implementation of the function to be in the same header. But that header is auto-generated code, and therefore is excluded from the rewriter. This caused `DoMultiDrawElements` and `HandleDrawElementsInstancedBaseVertexBaseInstanceANGLE` to be rewritten in the implementation file, but not the generated header.

## Solution
Don't spanify `DoMultiDrawElements` because it would require changing code in generated headers. The rewriter should be able to detect that the generated header would have to be rewritten, and if so it should not rewrite the code in the implementation file.
The alternative would be to remove the code generation exclusion.

## Note
There were other errors after this one too, which all relate to the same root cause:
```
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9931:32: error: no matching conversion for functional-style cast from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint, 1>' (aka 'span<unsigned int, 1>')
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9928:10: error: no matching member function for call to 'DoMultiDrawElements'
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:9981:7: error: no matching member function for call to 'DoMultiDrawElements'