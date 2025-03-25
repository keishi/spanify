# Build Failure Analysis: 2025_03_19_patch_303

## First error

../../base/containers/span.h:17:10: fatal error: 'algorithm' file not found
   17 | #include <algorithm>
      |          ^~~~~~~~~~~

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is adding `#include "base/containers/span.h"` in a C file. But this header transitively includes system headers like `<algorithm>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a C file.

## Solution
The rewriter should not add `#include "base/containers/span.h"` in C files.

## Note
The rewriter is trying to rewrite a C file which is not supported. This should not happen.