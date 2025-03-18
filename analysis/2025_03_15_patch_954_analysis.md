# Build Failure Analysis: 2025_03_15_patch_954

## First error

../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:28:1: error: expected member name or ';' after declaration specifiers
   28 | __BEGIN_DECLS

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is adding `#include "base/containers/span.h"` in a header file. But this header transitively includes system headers like `<string.h>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition.

## Solution
Do not include `base/containers/span.h` in header files that are inside `extern "C" {}`.

## Note
Multiple includes of `__stddef_size_t.h` may also be a related issue.