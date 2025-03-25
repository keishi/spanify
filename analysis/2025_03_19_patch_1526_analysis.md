# Build Failure Analysis: 137

## First error

../../base/containers/span.h:299:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'const std::basic_string<C, T, A> &'
  299 |           typename InternalPtrType = ElementType*>
      |                                                 ^

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code attempts to create a `base::span` from a `const std::basic_string<C, T, A>&` using `reinterpret_cast`. This results in the rewriter generating incorrect code for `InternalPtrType`, declaring it as a pointer to a reference (`const std::basic_string<C, T, A> &*`). The standard `base::span` class does not allow construction with pointer to reference types. The rewriter should not be using reinterpret_cast on a spanified value.

## Solution
The rewriter should avoid using reinterpret_cast on spanified variables. It needs to check if the code it wants to spanify is already spanified, and avoid adding a second unnecessary span conversion.

## Note
The second error is caused by the rewriter failing to apply subspan rewrite to a spanified return value.