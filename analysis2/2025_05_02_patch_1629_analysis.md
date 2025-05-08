# Build Failure Analysis: 2025_05_02_patch_1629

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:6483:12: error: no matching member function for call to 'GetWindowRectangle'
 6483 |     state_.GetWindowRectangle(index, data);
      |     ~~~~~~~^~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/service/gles2_cmd_decoder.cc:6556:3: note: in instantiation of function template specialization 'gpu::gles2::GLES2DecoderImpl::GetIndexedIntegerImpl<unsigned char>' requested here
 6556 |   GetIndexedIntegerImpl<GLboolean>("glGetBooleani_v", target, index, params);
      |   ^
../../gpu/command_buffer/service/context_state.h:334:8: note: candidate template ignored: could not match 'base::span<T>' against 'unsigned char *'
  334 |   void GetWindowRectangle(GLuint index, base::span<T> box) {
      |        ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `ContextState::GetWindowRectangle`, but failed to spanify the call site in `GLES2DecoderImpl::GetIndexedIntegerImpl`. The call site is passing a raw pointer, but the function now expects a span.

## Solution
The rewriter needs to spanify the call site to `GetWindowRectangle` in `GLES2DecoderImpl::GetIndexedIntegerImpl` to match the updated function signature.  The `data` argument should be converted to a span.  Since the size is known, a span can be constructed directly.

For example, the call should be changed from:

```c++
state_.GetWindowRectangle(index, data);
```

to

```c++
state_.GetWindowRectangle(index, base::span<T, 4>(data, 4));
```
Note that this fix assumes we know the size of `data` at the call site, which is 4 in this case.

## Note
The error occurs multiple times in `gles2_cmd_decoder.cc` because the `GetWindowRectangle` function is called from multiple specializations of `GetIndexedIntegerImpl`.