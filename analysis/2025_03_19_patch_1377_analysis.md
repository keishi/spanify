# Build Failure Analysis: 2025_03_19_patch_1377

## First error

../../net/http/http_cache_transaction.h:204:5: error: [chromium-style] Complex constructor has an inlined body.

## Category
Rewriter is including system headers inside a C++ class declaration, leading to style errors.

## Reason
The spanification process adds `#include <array>` to the header file, which transitively includes other headers, violating the Chromium style guide's rule against complex constructors having inlined bodies.

## Solution
The rewriter should avoid including headers that could transitively include complex code within class definitions.  In this case, using a forward declaration for `std::array` would avoid the problem.

## Note
The build failure also reported this error.
```
../../net/http/http_cache_transaction.h:203:3: error: [chromium-style] Complex class/struct needs an explicit out-of-line destructor.
  203 |   struct ValidationHeaders {
      |   ^