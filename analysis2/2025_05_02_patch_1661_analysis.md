# Build Failure: 2025_05_02_patch_1661

## First error

```
../../base/containers/span_forward_internal.h:20:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'const std::basic_string<C, T, A> &'
   20 |           typename InternalPtrType = ElementType*>
      |                                                 ^
```

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter created a span from a reference to a string, and then tried to `reinterpret_cast` to a pointer. The `span` template takes a `ElementType*` as `InternalPtrType`. Because the `ElementType` in question is a `const std::basic_string<C, T, A>&`, this becomes a pointer to a reference `const std::basic_string<C, T, A>&*`, which is not valid C++.

## Solution
The rewriter needs to avoid using `reinterpret_cast` when creating a span from a reference. Ideally the span should be created from the underlying data. But since it is used for SSO string, it may not be possible. The rewriter should simply not convert this code to span at all.

## Note
The second error `error: invalid operands to binary expression` is also related to the same issue. The `inline_cstr` is a span, and the code is trying to compare it to a `const uint8_t*`.
```
  309 |   if (cstr >= inline_cstr && cstr < inline_cstr.subspan(sizeof)(string)) {
      |       ~~~~ ^  ~~~~~~~~~~~