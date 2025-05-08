# Build Failure Analysis: 2025_05_02_patch_1757

## First error

../../gpu/command_buffer/client/gles2_interface_stub.h:14:7: error: missing '}' at end of definition of 'gpu::gles2::GLES2InterfaceStub'

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter added `#include "base/containers/span.h"` in `gpu/command_buffer/client/gles2_interface_stub_autogen.h`. But this header transitively includes system headers which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition.

## Solution
Do not add `#include "base/containers/span.h"` in header files.

## Note