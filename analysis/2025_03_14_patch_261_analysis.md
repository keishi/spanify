# Build Failure Analysis: 2025_03_14_patch_261

## First error

../../base/containers/span.h:299:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'
  299 |           typename InternalPtrType = ElementType*>

## Category
Rewriter needs to correctly handle spans of references.

## Reason
The rewriter is attempting to create a `base::span` of `CSSSelector&`, i.e. `base::span<CSSSelector&>`. This is not supported by `base::span`. The first template parameter of base::span is the element type, not a reference to it. 

The declaration of base::span is:
```c++
template <typename T,
          size_t Extent = dynamic_extent,
          typename InternalPtrType = T*>
class span;
```

`InternalPtrType` is declared as `ElementType*`. So if `ElementType` is a reference, the code will be invalid because you cannot have a pointer to a reference.

## Solution
The rewriter should handle `base::span<CSSSelector&>` by creating `base::span<CSSSelector>`. Also because `s` is no longer a reference it has to access members with `.`.

```c++
-  for (base::span<CSSSelector> s = base::span<CSSSelector&, 1>(&selector);;
+  for (base::span<CSSSelector> s = base::span<CSSSelector, 1>(&selector);;
        UNSAFE_TODO(++s)) {  // Termination condition within loop.
-    if (should_mark_func(*s)) {
+    if (should_mark_func(s[0])) {
       s->SetCoveredByBucketing(true);
     }

```

## Note
There are additional errors caused by the fact that `s` is a span, not a pointer. These will likely be resolved after addressing the error that this is a span of a reference.