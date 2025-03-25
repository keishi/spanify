```
# Build Failure Analysis: 2025_03_19_patch_590

## First error

../../gpu/command_buffer/tests/occlusion_query_unittest.cc:70:54: error: member reference base type 'GLfloat[16]' (aka 'float[16]') is not a structure or union
   70 |   glUniformMatrix4fv(matrix_loc_, 1, GL_FALSE, matrix.data());
      |                                                ~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The code attempts to call `.data()` on a `base::span<float>` object, but the spanified variable is then passed to a function that expects a raw pointer as an argument. The `glUniformMatrix4fv` function expects a raw pointer to the matrix data, which was originally passed using the variable `matrix`.  The rewriter added `.data()` to the spanified variable it did not arrayify.

## Solution
The rewriter should not have added `.data()` to the spanified variable. Since `base::span`'s `data()` method returns a raw pointer, adding `.data()` is not needed when passing a span to a function that expects a raw pointer.

```c++
-  glUniformMatrix4fv(matrix_loc_, 1, GL_FALSE, matrix.data());
+  glUniformMatrix4fv(matrix_loc_, 1, GL_FALSE, matrix);
```

## Note
No additional errors.