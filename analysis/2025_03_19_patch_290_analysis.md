# Build Failure Analysis: 2025_03_19_patch_290

## First error

../../ui/events/velocity_tracker/velocity_tracker.cc:97:22: error: cannot increment value of type 'base::span<const float>'
   97 |     r += *(a++) * ((b++)[0]);
      |                     ~^

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code `((b++)[0])` attempts to increment the `base::span<const float> b`. Incrementing a span like this is not supported and doesn't make sense. The rewriter should have recognized that this pattern will not work and avoided spanifying it.

## Solution
The rewriter needs to avoid spanifying function parameters if such parameter incrementing is used in an expression.

## Note
There are multiple errors caused by the function signature having been spanified.