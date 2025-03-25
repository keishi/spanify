# Build Failure Analysis: 2025_03_19_patch_1137

## First error

../../mojo/core/shared_buffer_unittest.cc:63:40: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter is attempting to convert a raw pointer to `base::span`, but is failing in the conversion. The call to `ReadMessageWithHandles` now expects a `base::span<MojoHandle, 1>`, but the code is providing `&client`, which is a `MojoHandle*`. This indicates that the rewriter isn't correctly handling the address-of operator when creating the span. The rewriter needs to recognize that it can take the address of the variable and create the span inline.

## Solution
The rewriter needs to be able to create the `base::span` object directly from the address of the `MojoHandle`.  The code could be rewritten to:

```c++
ReadMessageWithHandles(pipe, base::span<MojoHandle, 1>(&handle), 1);
```

This requires that the rewriter recognize the raw pointer and create the span inline.

## Note

The error occurs in multiple files and lines.