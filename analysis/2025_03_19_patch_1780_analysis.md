# Build Failure Analysis: 2025_03_19_patch_1780

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1544:5: error: no viable conversion from 'const array<remove_cv_t<int>, 2UL>' (aka 'const array<int, 2UL>') to 'const GLint *' (aka 'const int *')
 1544 |     kIsRowMajor,
      |     ^~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code changes replaced a raw C-style array with `std::array`. The test code passes `kIsRowMajor` to a function that expects a `const GLint*`. The size information is now available. However, it seems the compiler isn't automatically converting the `std::array` to a pointer in this context. The spanify tool converted a function parameter to use a `base::span`. When this occurs, the rewriter should handle call sites, which it failed to do in this case.

## Solution
Rewriter needs to recognize this pattern and correctly convert the arrayified argument to a `base::span`.

```c++
  const auto kIsRowMajor = std::to_array<GLint>({0, 1});
  data.header.num_uniforms = 2;
  for (uint32_t ii = 0; ii < data.header.num_uniforms; ++ii) {
    data.entry[ii].block_index = kBlockIndex[ii];
    data.entry[ii].offset = kOffset[ii];
    data.entry[ii].array_stride = kArrayStride[ii];
-    data.entry[ii].matrix_stride = kMatrixStride[ii];
+    data.entry[ii].matrix_stride = kMatrixStride[ii].data();
    data.entry[ii].is_row_major = kIsRowMajor[ii];
    data.entry[ii].sampler_type = kSamplerType[ii];
    data.entry[ii].precision = kPrecision[ii];
```

## Note
The rewriter spanified a function parameter, but failed to spanify the call site.