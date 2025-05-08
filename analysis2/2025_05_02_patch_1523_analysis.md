# Build Failure Analysis: 2025_05_02_patch_1523

## First error

../../third_party/blink/renderer/core/svg/svg_length_list.cc:75:12: error: no matching member function for call to 'ParseInternal'
   75 |     return ParseInternal(chars.data(), chars.data() + chars.size());
      |            ^~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `SVGLengthList::ParseInternal` was spanified, but the call site `SVGLengthList::SetValueAsString` is passing a raw pointer where a span is expected. The argument `chars.data()` is a raw pointer, but the function `ParseInternal` now expects a `base::span`. The function `WTF::VisitCharacters` uses a lambda that is instantiating the call to `ParseInternal`, and determining the type of the span.

## Solution
The rewriter spanified a function, but failed to spanify a call site. The call site needs to be updated to pass in a span instead of a pointer. In the code, a span should be constructed from `chars`:

```
return ParseInternal(base::span(chars.data(), chars.size()), end);
```

## Note