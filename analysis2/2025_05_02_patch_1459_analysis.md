```
# Build Failure Analysis: 2025_05_02_patch_1459

## First error

../../gpu/command_buffer/client/gl_helper_scaling.cc:556:35: error: no viable conversion from 'std::array<std::array<GLfloat, 4>, 3>' (aka 'array<array<float, 4>, 3>') to 'base::span<const GLfloat[4], 3> *' (aka 'span<const float[4], 3> *')
  556 |                                   color_weights_);
      |                                   ^~~~~~~~~~~~~~
../../gpu/command_buffer/client/gl_helper_scaling.cc:117:51: note: passing argument to parameter 'color_weights' here
  117 |                   base::span<const GLfloat[4], 3> color_weights[4]);
      |                                                   ^

## Category
Pointer passed into spanified function parameter.

## Reason
The code attempts to pass `ScalerImpl::color_weights_` to `ShaderProgram::UseProgram`. `ScalerImpl::color_weights_` is defined as `std::array<std::array<GLfloat, 4>, 3>`, while `ShaderProgram::UseProgram` is declared to take `base::span<const GLfloat[4], 3> color_weights[4]`. The type `base::span<const GLfloat[4], 3>` decays to a pointer, so `base::span<const GLfloat[4], 3> color_weights[4]` is actually equivalent to `base::span<const GLfloat[4], 3>* color_weights`. The code is thus passing a `std::array` to a pointer to `base::span`, which causes a type mismatch.

## Solution
The function declaration `ShaderProgram::UseProgram` should take `base::span<const GLfloat[4], 3> color_weights` instead of `base::span<const GLfloat[4], 3> color_weights[4]`. Then the callsite in `ScalerImpl::ResampleTexture` should use `base::span(color_weights_)` to call `ShaderProgram::UseProgram`.
```diff
--- a/gpu/command_buffer/client/gl_helper_scaling.cc
+++ b/gpu/command_buffer/client/gl_helper_scaling.cc
@@ -114,7 +114,7 @@
                   bool scale_x,
                   bool flip_y,
 -                  const GLfloat color_weights[3][4]);
+                  base::span<const GLfloat[4], 3> color_weights);
  
  bool Initialized() const { return position_location_ != -1; }
  
@@ -572,7 +572,8 @@
  raw_ptr<GLES2Interface> gl_;
  raw_ptr<GLHelperScaling> scaler_helper_;
  GLHelperScaling::ScalerStage spec_;
- GLfloat color_weights_[3][4];  // A vec4 for each plane.
+ std::array<std::array<GLfloat, 4>, 3>
+      color_weights_;  // A vec4 for each plane.
  GLuint intermediate_texture_;
  gfx::Size intermediate_texture_size_;
  scoped_refptr<ShaderProgram> shader_program_;
@@ -1256,7 +1261,7 @@
  const gfx::Size& dst_size,
  bool scale_x,
  bool flip_y,
- const GLfloat color_weights[3][4]) {
+ base::span<const GLfloat[4], 3> color_weights) {
  gl_->UseProgram(program_);
  
  // OpenGL defines the last parameter to VertexAttribPointer as type

--- a/gpu/command_buffer/client/gl_helper_scaling.cc
+++ b/gpu/command_buffer/client/gl_helper_scaling.cc
@@ -553,7 +553,7 @@
          dst_size, scaler_->scale_x, scaler_->flip_y,
          scaler_->spec_.reverse_x_direction, scaler_->spec_.reverse_y_direction);
 
-    shader_program_->UseProgram(src_texture_size, src_rect, dst_size, scaler_->scale_x,
+    shader_program_->UseProgram(src_texture_size, src_rect, dst_size, scaler_->scale_x,base::span(color_weights_),
         scaler_->flip_y, scaler_->color_weights_);
   }
   // Disable intermediate texture, and blit final image to output.
```

## Note
The rest of the errors are caused by incorrect usage of `color_weights` in the `ShaderProgram::UseProgram` function, where the code is trying to use the span as a C-style array. The suggested fix for the first error should fix the rest of the errors.