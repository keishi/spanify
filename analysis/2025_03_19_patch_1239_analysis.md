# Build Failure Analysis: 2025_03_19_patch_1239

## First error

../../base/metrics/persistent_memory_allocator.h:1010:22: error: member reference type 'const base::raw_span<volatile std::atomic<Reference>, AllowPtrArithmetic>' (aka 'const span<volatile atomic<unsigned int>, dynamic_extent, raw_ptr<volatile atomic<unsigned int>, (RawPtrTraits)8U | AllowPtrArithmetic>>') is not a pointer; did you mean to use '.'?

## Category
Rewriter needs to handle spanified variable passed into a function.

## Reason
The code is trying to use `reference_` as a pointer (using `->`), but it was spanified. The correct way to access the data is to use the `.` operator.

## Solution
The spanified variable should be referenced by the `.` operator and not the `->` operator.

```c++
     return reference_.load(std::memory_order_relaxed);