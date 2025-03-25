# Build Failure Analysis: 2025_03_19_patch_864

## First error

../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:28:1: error: expected member name or ';' after declaration specifiers
   28 | __BEGIN_DECLS
      | ^~~~~~~~~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/x86_64-linux-gnu/sys/cdefs.h:114:31: note: expanded from macro '__BEGIN_DECLS'
  114 | # define __BEGIN_DECLS  extern "C" {
      |                         ~~~~~~ ^

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is adding `#include "base/containers/span.h"` in a header file. But this header transitively includes system headers like `<string.h>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition.

## Solution
Do not include base/containers/span.h inside of gpu/command_buffer/client/gles2_interface_autogen.h. Instead forward declare base::span. Then in the .cc file include base/containers/span.h.

## Note
The `gles2_cmd_decoder_autogen.h` also had this issue, but there wasn't a build failure associated with it.