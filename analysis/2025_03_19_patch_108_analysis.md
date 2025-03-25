# Build Failure Analysis: 2025_03_19_patch_108

## First error

../../base/containers/span.h:299:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'

## Category
Rewriter cannot use span<T&>

## Reason
The rewriter attempted to create a `base::span` with a reference type (`CSSSelector&`), but `base::span` does not support reference types. The error message "'InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'" indicates that span's underlying pointer cannot be a pointer to a reference.

## Solution
The rewriter needs to avoid creating spans of references (span<T&>). In this case, `CSSSelector*` is the correct underlying representation.

## Note
The remaining errors are cascading errors from the first error.