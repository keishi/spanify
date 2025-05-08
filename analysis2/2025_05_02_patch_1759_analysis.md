# Build Failure Analysis: 2025_05_02_patch_1759

## First error

../../gpu/command_buffer/client/gles2_interface_stub.h:14:7: error: missing '}' at end of definition of 'gpu::gles2::GLES2InterfaceStub'

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is adding `#include "base/containers/span.h"` in `gpu/command_buffer/client/gles2_interface_stub_autogen.h`. But this header transitively includes system headers like `<algorithm>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition in `gpu/command_buffer/client/gles2_interface_stub.h`.

## Solution
The rewriter should not add include directives inside header files. Instead, it can add the include directive to the source file.

## Note
There are more errors in the build log but they are all caused by the same problem.