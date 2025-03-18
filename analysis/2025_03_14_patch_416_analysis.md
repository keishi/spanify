# Build Failure Analysis: 2025_03_14_patch_416

## First error

../../mojo/public/cpp/test_support/lib/test_support.cc:21:21: error: no viable conversion from 'char **' to 'base::span<char *>'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The function `MojoTestSupportEnumerateSourceRootRelativeDirectory` returns a `char**`. This `char**` is then used to initialize a `base::span<char*>`. However, base::span cannot accept a `char**` directly. The `names` variable cannot be rewritten by the rewriter today. Ideally the rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.

## Solution
The rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.

```c++
  char** temp_names = MojoTestSupportEnumerateSourceRootRelativeDirectory(
      relative_path.c_str());
  base::span<char*> names = temp_names;
```

## Note
There is also a second error stemming from the fact that you cannot increment a span like a normal pointer.
```
../../mojo/public/cpp/test_support/lib/test_support.cc:24:58: error: cannot increment value of type 'base::span<char *>'
   24 |   for (base::span<char*> ptr = names; ptr[0] != nullptr; ++ptr) {
      |                                                          ^ ~~~