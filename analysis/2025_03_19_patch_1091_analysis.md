```
# Build Failure Analysis: 2025_03_19_patch_1091

## First error

../../gpu/command_buffer/service/texture_manager.cc:495:53: error: no viable conversion from 'std::array<GLuint, kNumDefaultTextures>' (aka 'array<unsigned int, kNumDefaultTextures>') to 'const GLuint *' (aka 'const unsigned int *')
  495 |     glDeleteTextures(std::size(black_texture_ids_), black_texture_ids_);
      |                                                     ^~~~~~~~~~~~~~~~~~
../../ui/gl/gl_bindings_autogen_gl.h:2821:60: note: passing argument to parameter 'textures' here
 2821 |   virtual void glDeleteTexturesFn(GLsizei n, const GLuint* textures) = 0;
      |                                                            ^

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `GLuint black_texture_ids_[kNumDefaultTextures]` to `std::array<GLuint, kNumDefaultTextures> black_texture_ids_;`. However, `glDeleteTextures` expects a `const GLuint*`, not a `std::array`. When calling a third-party function, the rewriter needs to add `.data()` to get a pointer to the underlying array.

## Solution
The rewriter should insert `.data()` after `black_texture_ids_` to get a pointer to the underlying array:

```diff
--- a/gpu/command_buffer/service/texture_manager.cc
+++ b/gpu/command_buffer/service/texture_manager.cc
@@ -492,7 +492,7 @@
   void DestroyTextures(bool have_context) {
     if (have_context) {
       if (texture_count_) {
-        glDeleteTextures(texture_count_, textures_.data());
+        glDeleteTextures(texture_count_, textures_.data());
         texture_count_ = 0;
       }
 
@@ -495,7 +495,7 @@
       if (glDeleteTexturesFn) {
         // Delete default textures that would otherwise leak.
         if (black_texture_ids_[0]) {
-          glDeleteTexturesFn(std::size(black_texture_ids_), black_texture_ids_);
+          glDeleteTexturesFn(std::size(black_texture_ids_), black_texture_ids_.data());
           for (GLuint& id : black_texture_ids_)
             id = 0;
         }

```

## Note
None