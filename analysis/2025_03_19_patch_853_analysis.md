# Build Failure Analysis: 2025_03_19_patch_853

## First error

../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:28:1: error: expected member name or ';' after declaration specifiers
   28 | __BEGIN_DECLS
      | ^~~~~~~~~~~~~

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is adding `#include "base/containers/span.h"` in `gpu/command_buffer/client/gles2_interface.h`. But this header transitively includes system headers like `<string.h>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition.

## Solution
The rewriter should avoid adding `#include "base/containers/span.h"` in a header file that is included inside a class definition.

## Note
The other files are failing due to the same reason.