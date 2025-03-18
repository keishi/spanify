# Build Failure Analysis: 2025_03_14_patch_1485

## First error

../../mojo/public/cpp/bindings/lib/sync_handle_registry.cc:150:20: error: no matching conversion for functional-style cast from 'MojoResult *' (aka 'unsigned int *') to 'base::span<MojoResult, 1>' (aka 'span<unsigned int, 1>')

## Category
Rewriter needs to generate code to construct a span from the address of a variable and a constant size.

## Reason
The rewriter is attempting to construct a `base::span<MojoResult, 1>` from a `MojoResult*`. The `base::span` constructor expects an array by reference but the code is providing a raw pointer to a single `MojoResult` variable. This does not satisfy the constructor requirements, hence the error "no matching conversion". The code used to work before the change because it passed `MojoResult*` directly to `wait_set_.Wait()` before spanification.

## Solution
The rewriter needs to generate `base::span` construction code that correctly creates a span from a pointer and a size by doing so: `base::span(ready_result, 1)`. The fix needs to create a temporary array like the following:
```c++
MojoResult temp[] = {ready_handle_result};
wait_set_.Wait(..., base::span(temp, 1));
```

## Note
The wait_set_unittest.cc also has the same error, which means the same fix applies.