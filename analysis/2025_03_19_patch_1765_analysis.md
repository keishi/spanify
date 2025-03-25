# Build Failure Analysis: 2025_03_19_patch_1765

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1747:27: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `SetupProgramForVariables` function's signature was changed to take `base::span<const VarInfo>` as an argument, but the call sites are passing raw pointers (`&kFragmentVarying`). The compiler is unable to convert `&kFragmentVarying` to `base::span<const VarInfo, 1>`. The size information is not available at the callsite because it's just a pointer. This is a case where the rewriter failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to be able to handle the implicit conversion of a raw pointer to a `base::span`. The rewritten expression should explicitly construct the span to provide the necessary size.

```c++
//Example:
Program* SetupProgramForVariables(const VarInfo* fragment_variables) {
  SetupProgramForVariables(base::span<const VarInfo>(fragment_variables, 1));
}
```

## Note
Multiple instances of the same error exist within the same file.
```
../../gpu/command_buffer/service/program_manager_unittest.cc:1747:27: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'
../../gpu/command_buffer/service/program_manager_unittest.cc:1764:27: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'
../../gpu/command_buffer/service/program_manager_unittest.cc:1781:27: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'
../../gpu/command_buffer/service/program_manager_unittest.cc:1796:19: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'
../../gpu/command_buffer/service/program_manager_unittest.cc:1812:19: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'
../../gpu/command_buffer/service/program_manager_unittest.cc:1830:29: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'