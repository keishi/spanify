# Build Failure Analysis: 2025_03_15_patch_127

## First error

../../gpu/command_buffer/tests/occlusion_query_unittest.cc:70:54: error: member reference base type 'GLfloat[16]' (aka 'float[16]') is not a structure or union
   70 |   glUniformMatrix4fv(matrix_loc_, 1, GL_FALSE, matrix.data());
      |                                                ~~~~~~^~~~~

## Category
Rewriter needs to avoid adding `.data()` when spanifying a function parameter and that variable is used with glUniformMatrix4fv.

## Reason
The code attempts to call `.data()` on a `base::span<float>` variable named `matrix` passed to the `SetMatrix` function. The `glUniformMatrix4fv` function expects a `const GLfloat*` as the last parameter. However, the `.data()` member is not valid for a variable of type `float[16]`.

The signature of `SetMatrix` has been changed to expect a `base::span<float> matrix` variable as parameter, instead of `float* matrix`, which resulted in the tool attempting to convert it with `.data()` when calling `glUniformMatrix4fv`.

## Solution
The rewriter should not add `.data()` when it converts a raw pointer to span. If there is an implicit cast to pointer, that cast will be used.

The spanified SetMatrix function looks like this:

```c++
static void SetMatrix(float x, float z, float scale, base::span<float> matrix) {
  matrix[0] = scale;
  matrix[1] = 0.0f;
```

When calling glUniformMatrix4fv the matrix variable should be passed directly.

## Note
There are more error messages like this one that will likely be fixed when addressing this issue.
```
../../gpu/command_buffer/tests/occlusion_query_unittest.cc:70:54: error: member reference base type 'GLfloat[16]' (aka 'float[16]') is not a structure or union
   70 |   glUniformMatrix4fv(matrix_loc_, 1, GL_FALSE, matrix.data());
      |                                                ~~~~~~^~~~~