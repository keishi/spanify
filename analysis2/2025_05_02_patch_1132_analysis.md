# Build Failure Analysis: 2025_05_02_patch_1132

## First error

```
../../mojo/public/cpp/test_support/lib/test_support.cc:21:21: error: no viable conversion from 'char **' to 'base::span<char *>'
   21 |   base::span<char*> names = MojoTestSupportEnumerateSourceRootRelativeDirectory(
      |                     ^       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   22 |       relative_path.c_str());
      |       ~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The function `MojoTestSupportEnumerateSourceRootRelativeDirectory` returns a `char**`. The rewriter changed the type of `names` to `base::span<char*>`, but it didn't generate code to construct a span from the returned pointer. The error message "no viable conversion from 'char **' to 'base::span<char *>'" indicates that the compiler doesn't know how to convert a raw pointer to a span automatically.

## Solution
The rewriter needs to generate code that constructs a `base::span` from the `char**` returned by `MojoTestSupportEnumerateSourceRootRelativeDirectory`. Since the size of the returned array is not explicitly provided, the rewriter will need to determine the correct size. A possible solution is to use `base::make_span` with a size parameter, assuming that the size can be determined before passing to the span constructor. This can be done by iterating through the `char**` until a `nullptr` is encountered.

Alternatively, since the code iterates through the `char**` until a nullptr is found, the rewriter can skip the spanification entirely.

## Note
The second error shows that the rewriter incorrectly tried to increment the span directly.
```
../../mojo/public/cpp/test_support/lib/test_support.cc:24:58: error: cannot increment value of type 'base::span<char *>'
   24 |   for (base::span<char*> ptr = names; ptr[0] != nullptr; ++ptr) {
      |                                                          ^ ~~~
```