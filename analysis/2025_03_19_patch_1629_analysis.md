# Build Failure Analysis: 2025_03_19_patch_1629

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16602:16: error: no matching conversion for functional-style cast from 'GLsizei *' (aka 'int *') to 'base::span<GLsizei, 1>' (aka 'span<int, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function argument `base::span<GLsizei, 1>` was spanified, but the rewriter failed to spanify the call site with a raw pointer `&num_sample_counts`. This happened in the block where the code was assigning the address of a `GLsizei` variable named `num_sample_counts` to the values, which is of type `base::span<GLsizei, 1>`.

## Solution
The rewriter needs to recognize the address of an assignable value and spanify it at the call site.

```c++
       num_values = 1;
-      values = base::span<GLsizei, 1>(&num_sample_counts);
+      values = base::span<GLsizei, 1>(&num_sample_counts, 1);
```

## Note
There may be other similar errors in this patch.