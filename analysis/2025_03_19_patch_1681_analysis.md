# Build Failure Analysis: 2025_03_19_patch_1681

## First error

../../third_party/blink/renderer/core/svg/svg_length_list.cc:81:12: error: no matching member function for call to 'ParseInternal'
   81 |     return ParseInternal(chars.data(), chars.data() + chars.size());
      |            ^~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `SVGLengthList::ParseInternal` was spanified to take a `base::span<const CharType> ptr` argument. However, at the call site in `SVGLengthList::SetValueAsString`, the code is still passing a raw pointer (`chars.data()`) and a separate end pointer (`chars.data() + chars.size()`). The spanified function should receive a `base::span` object, not a raw pointer. This results in a type mismatch.

## Solution
The rewriter failed to update the call site to construct a `base::span` object before passing it to `ParseInternal`. The call site should be updated to explicitly pass a `base::span` constructed from the data and size. The code change should look like this:
```c++
return ParseInternal(base::span(chars.data(), chars.size()), chars.data() + chars.size());
```

## Note
The diff also includes a change to dereference the span `ptr` by using `ptr[0]` instead of `*ptr`. This is valid. The original code accesses the underlying data via pointer arithmetic `IsHTMLSpace<CharType>(*ptr)`, span also supports random access through the subscript operator `[]`, so replacing `*ptr` with `ptr[0]` has the same functionality and is considered valid for span. The rewriter did not remove pointer arithmetic and that would be a separate issue.
```