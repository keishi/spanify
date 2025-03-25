# Build Failure Analysis: 2025_03_19_patch_1475

## First error

../../gpu/command_buffer/service/context_state.cc:509:31: error: no matching member function for call to 'GetValues'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `Vec4::GetValues` function, but failed to spanify the call site, leading to a type mismatch. The code now expects a `base::span<GLfloat>` but it is given `GLfloat* `.

## Solution
The rewriter should be able to spanify a function and a call site at the same time. To fix this error, the call sites of the spanified `Vec4::GetValues` should be updated to pass a `base::span` argument instead of a raw pointer. 

Here's an example of how the corrected code would look. Note that the original code had raw pointers like `GLfloat fv[4]` which must be rewritten as `std::array<GLfloat, 4>`.

```c++
   GLfloat fv[4];
   v.GetValues(fv);
```

should become

```c++
   std::array<GLfloat, 4> fv;
   v.GetValues(base::span(fv));
```

## Note
The other errors are the same.