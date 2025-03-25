# Build Failure Analysis: 2025_03_19_patch_206

## First error

../../gpu/command_buffer/service/raster_decoder.cc:925:64: error: 'CommandInfo' is a private member of 'gpu::raster::RasterDecoderImpl'

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The code uses `std::to_array` which is a C++20 feature. This caused the span rewriter to add `#include <array>`. Because `command_info` is declared inside the `RasterDecoderImpl` class, the included system header introduced `__BEGIN_DECLS` which is causing the error.

## Solution
The rewriter is including system headers like `<string.h>` inside a class definition. But this header transitively includes system headers like `<string.h>` which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition. The rewriter should avoid adding `#include <array>` inside the class definition.

## Note
Several other errors are related to the fact that the command info is now private to the class due to being defined inside it. Moving the definition outside the class definition would also fix the issue. The rewriter should probably do the same thing in this case to avoid this issue in the future.