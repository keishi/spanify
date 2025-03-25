# Build Failure Analysis: 2025_03_19_patch_1713

## First error

../../base/containers/span.h:299:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'

## Category
Rewriter cannot handle address of a spanified variable passed into a function.

## Reason
The original code iterates through a linked list of `CSSSelector` objects using a raw pointer. The rewriter attempts to replace the raw pointer with a `base::span<CSSSelector&, 1>` initialized with the address of the first element. However, `base::span`'s template parameter requires the element to be passed by value.  Because we are taking the address of the variable and then incrementing that address, a `span<CSSSelector&, 1>` was created. This caused problems during compilation because the increment operation `UNSAFE_TODO(++s)` is not valid when `InternalPtrType` is declared as a pointer to a reference of type `CSSSelector &`. Also the code tries to access members of the `CSSSelector` object through the span object using `s->` which is also not valid.

## Solution
The rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span. This would allow the code to compile correctly, as the span would be initialized with a valid address, and the increment operation would be performed on the correct type. However, this construct should be flagged as unsupported since the linked list will no longer be connected. The proper fix is not to spanify this variable.

## Note
The rest of the errors are due to the attempted pointer dereference on the span which isn't a pointer.