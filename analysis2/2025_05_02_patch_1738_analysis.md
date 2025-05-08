# Build Failure Analysis: 2025_05_02_patch_1738

## First error

../../url/url_canon_relative.cc:648:12: error: no matching function for call to 'DoResolveAbsoluteFile'
  648 |     return DoResolveAbsoluteFile(relative_url, relative_component,
      |            ^~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_relative.cc:702:10: note: in instantiation of function template specialization 'url::(anonymous namespace)::DoResolveRelativeURL<char>' requested here
  702 |   return DoResolveRelativeURL<char>(
      |          ^
../../url/url_canon_relative.cc:548:6: note: candidate template ignored: could not match 'base::span<const CharT>' against 'const char *'
  548 | bool DoResolveAbsoluteFile(base::span<const CharT> relative_url,
      |      ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoResolveAbsoluteFile` was spanified. However, the call sites at lines 648 and 715 are still passing raw pointers (`const char*` and `const char16_t*`) to this function, rather than a `base::span`.

## Solution
The rewriter needs to update the call sites of `DoResolveAbsoluteFile` to pass a `base::span`. This can be done by constructing a `base::span` from the raw pointer and passing that to the function.
For example, at line 648:

```c++
return DoResolveAbsoluteFile(base::span<const char>(relative_url, strlen(relative_url)), relative_component,
                             query_converter, output, file_url);
```
and at line 715:
```c++
return DoResolveAbsoluteFile(base::span<const char16_t>(relative_url, base::StringSize(relative_url)), relative_component,
                             query_converter, output, file_url);
```

## Note
The error message indicates that the compiler could not find a matching function for the call because the argument types did not match the function signature. The function signature now expects a `base::span<const CharT>`, but the call site is passing a raw pointer.