# Build Failure Analysis: 2025_03_19_patch_1817

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:290:52: error: no viable conversion from 'UniformInfo[]' (aka 'gpu::gles2::TestHelper::UniformInfo[]') to 'base::span<UniformInfo>' (aka 'span<gpu::gles2::TestHelper::UniformInfo>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter has modified the `SetupShaderExpectations` function to take a `base::span<UniformInfo>` as an argument, but it failed to update the call site in `ProgramManagerWithShaderTest::TestBasic`. The function call is still passing a raw array `kUniforms`, which is not implicitly convertible to `base::span<UniformInfo>`. The size information is unavailable, causing the compiler to error. This is a bug in the rewriter that it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should be able to correctly rewrite the function call site and convert the raw array to a `base::span`. Pass the `kUniforms` to `base::span`, such as `base::span(kUniforms, kNumUniforms)`.

## Note
The same error occurred in line 334 of the same file.