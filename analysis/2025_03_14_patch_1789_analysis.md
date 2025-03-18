# Build Failure Analysis: 2025_03_14_patch_1789

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:310:19: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint>' (aka 'span<unsigned int>')
  310 |                   &reserved_ids_[0]);
      |                   ^~~~~~~~~~~~~~~~~

## Category
Rewriter needs to construct a span from a C-style array.

## Reason
The rewriter is attempting to pass the address of the first element of a C-style array to a function expecting a `base::span`. The rewriter needs to generate the appropriate span constructor call.
The relevant code:
```c++
  GetIdHandler(SharedIdNamespaces::kTextures)->MakeIds(this, 0, 1, &reserved_ids_[0]);
```
Here, `reserved_ids_` is a member of `GLES2Implementation` and the type is `GLuint[kNumReservedIds]`. So `&reserved_ids_[0]` has type `GLuint*`.
But `MakeIds` expects the last argument to be `base::span<GLuint> ids`.
There is no implicit conversion from `GLuint*` to `base::span<GLuint>`.

## Solution
The rewriter needs to generate a `base::span` from the pointer. So it should rewrite this line to:

```c++
  GetIdHandler(SharedIdNamespaces::kTextures)->MakeIds(this, 0, 1, base::span(reserved_ids_));
```

## Note
All the other errors are the same as the first error.