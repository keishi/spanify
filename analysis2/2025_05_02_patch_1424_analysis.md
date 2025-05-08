# Build Failure Analysis: 2025_05_02_patch_1424

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:291:52: error: no viable conversion from 'UniformInfo[]' (aka 'gpu::gles2::TestHelper::UniformInfo[]') to 'base::span<UniformInfo>' (aka 'span<gpu::gles2::TestHelper::UniformInfo>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `SetupShaderExpectations` in `ProgramManagerWithShaderTest` class takes a `base::span<UniformInfo>` as an argument, but the code is passing a raw array `kUniforms` to it. The rewriter failed to recognize this call site where a raw pointer is being passed to a spanified function. The size of the `kUniforms` array is available as `kNumUniforms` which the rewriter could use to create a span.

## Solution
The rewriter should wrap the raw array with `base::span` when passing it to a spanified function.
For example in `ProgramManagerWithShaderTest::SetupShaderExpectations` function, the code should be changed from:
```c++
SetupShaderExpectations(kAttribs, kNumAttribs, kUniforms, kNumUniforms,
```
to
```c++
SetupShaderExpectations(kAttribs, kNumAttribs, base::span(kUniforms, kNumUniforms),
```

## Note
The same error occurs in `ProgramManagerWithShaderTest::SetupShaderExpectations` and `ProgramManagerWithCacheTest::SetExpectationsForProgramLink` and needs to be fixed in both places.
```
../../gpu/command_buffer/service/program_manager_unittest.cc:335:54: error: no viable conversion from 'UniformInfo[]' (aka 'gpu::gles2::TestHelper::UniformInfo[]') to 'base::span<UniformInfo>' (aka 'span<gpu::gles2::TestHelper::UniformInfo>')
  335 |       SetupShaderExpectations(kAttribs, kNumAttribs, kUniforms, kNumUniforms,
                                       ^~~~~~~~~