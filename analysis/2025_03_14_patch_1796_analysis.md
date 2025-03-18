# Build Failure Analysis: 2025_03_14_patch_1796

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:1198:25: error: no matching conversion for functional-style cast from 'GLint *' (aka 'int *') to 'base::span<GLint, 1>' (aka 'span<int, 1>')
 1198 |   if (!GetHelper(pname, base::span<GLint, 1>(&value))) {
      |                         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to use ".data()" to pass data from a `std::array` to span.

## Reason
The rewriter is attempting to pass the address of a local variable (`&value`) to a function expecting a `base::span`. This works with raw pointers because of implicit conversion, but `base::span` doesn't allow implicit construction from a raw pointer. The correct way to create a `base::span` from a single element is to use a stack allocated array with one element. In this case, the function `GetHelper` is being called with `base::span<GLint,1>(&value)`. The variable `value` is not an array and therefore it cannot be used to initialize `base::span` this way.

## Solution
The code should construct a `std::array` instead of passing the address of a `GLint` directly, so that the span constructor can use `.data()` correctly. The rewriter could use `std::array`.

```c++
std::array<GLint, 1> value_array = {value};
if (!GetHelper(pname, base::span<GLint>(value_array.data(), value_array.size()))) {
```

## Note
This issue appears multiple times in the file. The rewriter needs to be updated to handle local `GLint value` variables correctly when passing them to span arguments. There are a few places where `GetHelper` is being called with a single GLint value, and the generated code is incorrect.
```
../../gpu/command_buffer/client/gles2_implementation.cc:1222:25: error: no matching conversion for functional-style cast from 'GLint *' (aka 'int *') to 'base::span<GLint, 1>' (aka 'span<int, 1>')
 1222 |   if (!GetHelper(pname, base::span<GLint, 1>(&value))) {

../../gpu/command_buffer/client/gles2_implementation.cc:1255:25: error: no matching conversion for functional-style cast from 'GLint *' (aka 'int *') to 'base::span<GLint, 1>' (aka 'span<int, 1>')
 1255 |   if (!GetHelper(pname, base::span<GLint, 1>(&value))) {