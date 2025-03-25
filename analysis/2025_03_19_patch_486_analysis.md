# Build Failure Analysis: 2025_03_19_patch_486

## First error

../../gpu/command_buffer/client/gl_helper_scaling.cc:554:35: error: cannot initialize a parameter of type 'const GLfloat (*)[4]' (aka 'const float (*)[4]') with an rvalue of type 'value_type *' (aka 'std::array<float, 4> *')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The original code used a C-style array `GLfloat color_weights_[3][4]`. The rewriter converted this to `std::array<std::array<GLfloat, 4>, 3> color_weights_`. The `ShaderProgram::UseProgram` function expects a pointer to the first element of a C-style array of `GLfloat[4]`. The code used to pass `color_weights_`, but it now needs to pass `color_weights_.data()`. This works for `std::array` as the rewriter has done. However the function also uses `value_type*` which is the same as `std::array<GLfloat, 4>*`. The fix is to dereference this pointer and then call data() again to get a `GLfloat*` which can be implicitly cast to a `const GLfloat*`.

## Solution
The rewriter should have added .data() after the variable `color_weights_` before, but failed to do so.

```c++
       shader_program_->UseProgram(src_texture_size, src_rect, result_size,
                                   spec_.scale_x, spec_.flip_output,
-                                  color_weights_);
+                                  color_weights_.data()->data());
```

## Note
The first parameter of `ShaderProgram::UseProgram` is defined as `const GLfloat color_weights[3][4]`. The rewriter converted `color_weights_` to `std::array<std::array<GLfloat, 4>, 3>`. To resolve the error the compiler requires `color_weights_.data()->data()` which converts the `std::array` to a `GLfloat *`.
```c++
virtual void UseProgram(const gfx::Size& src_texture_size,
                           const gfx::Rect& src_rect,
                           const gfx::Size& result_size,
                           GLfloat scale_x,
                           bool flip_output,
                           const GLfloat color_weights[3][4]) = 0;