```
# Build Failure Analysis: 2025_03_16_patch_1176

## First error

../../gpu/command_buffer/client/raster_implementation_impl_autogen.h:60:29: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to `.data()` call when spanified `GLuint*` is passed to generated code.

## Reason
The `DeleteQueriesEXTHelper` function signature was changed to accept a `base::span<const GLuint>` instead of `const GLuint*`. The `raster_implementation_impl_autogen.h` file has generated code that still passes a raw pointer to this function.  The compiler cannot implicitly convert a raw pointer to a `base::span`.  The span needs to be constructed from the raw pointer and a size by either using `.data()` or by using the default span constructor with pointer and size.

## Solution
The rewriter should identify call sites within generated files where it needs to add `.data()` to the expression when a function is spanified.

In this case, the rewriter should generate code like this:
```
   60 |   DeleteQueriesEXTHelper(n, queries.data());
```

## Note
The category name might be too specific. A more general category like "Rewriter needs to add .data() to a spanified parameter in generated code" could apply.