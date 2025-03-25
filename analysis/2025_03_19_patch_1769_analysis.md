# Build Failure Analysis: 2025_03_19_patch_1769

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:539:9: error: use of undeclared identifier 'kUniform1Name'; did you mean 'ProgramManagerWithShaderTest::kUniform1Name'?
  539 |         kUniform1Name,
      |         ^~~~~~~~~~~~~
      |         ProgramManagerWithShaderTest::kUniform1Name

## Category
Rewriter needs to add scope to class member used in array initialization.

## Reason
The rewriter converted `ProgramManagerWithShaderTest::UniformInfo kUniforms[]` to `auto kUniforms = std::to_array<ProgramManagerWithShaderTest::UniformInfo>({ ... });`. The braced list is no longer in the scope of the `ProgramManagerWithShaderTest` class. Thus, the rewriter needs to add `ProgramManagerWithShaderTest::` to variables like `kUniform1Name`.

## Solution
The rewriter needs to add scope to class member used in array initialization.

## Note