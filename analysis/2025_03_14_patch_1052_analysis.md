# Build Failure Analysis: 2025_03_14_patch_1052

## First error

../../gpu/command_buffer/service/texture_manager.cc:495:53: error: no viable conversion from 'std::array<GLuint, kNumDefaultTextures>' (aka 'array<unsigned int, kNumDefaultTextures>') to 'const GLuint *' (aka 'const unsigned int *')
  495 |     glDeleteTextures(std::size(black_texture_ids_), black_texture_ids_);
      |                                                     ^~~~~~~~~~~~~~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:2821:60: note: passing argument to parameter 'textures' here
 2821 |   virtual void glDeleteTexturesFn(GLsizei n, const GLuint* textures) = 0;
      |                                                            ^

## Category
Rewriter needs to add .data() when converting a `std::array` to a raw pointer in a system library function call.

## Reason
The `glDeleteTextures` function expects a `const GLuint*` as its second argument, but the rewriter directly passes a `std::array<GLuint, kNumDefaultTextures>`. `std::array` does not implicitly convert to a raw pointer. The rewriter should have added `.data()` to `black_texture_ids_` when calling `glDeleteTextures` to pass the array's underlying pointer.

## Solution
The rewriter needs to append `.data()` to the `std::array` variable when it is passed as an argument to `glDeleteTextures`.

```c++
//Corrected Code
glDeleteTextures(std::size(black_texture_ids_), black_texture_ids_.data());
```

## Note
The error message indicates that `glDeleteTexturesFn` is a virtual function, suggesting it's part of a GL binding interface. The file `ui/gl/gl_bindings_autogen_gl.h` confirms this. The fix is to ensure the correct pointer is passed to this GL function.