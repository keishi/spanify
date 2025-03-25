# Build Failure Analysis: 2025_03_19_patch_1520

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:2549:63: error: 'CommandInfo' is a private member of 'gpu::gles2::GLES2DecoderImpl'

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter is attempting to use `std::to_array` to initialize `command_info`. However, because the definition of `GLES2DecoderImpl::CommandInfo` is private, it is not accessible outside the class, including at the point of initialization.
This pattern is due to the span rewriter attempting to add `#include <array>` inside of a class definition which includes system headers that use `extern "C"` declarations. This breaks the C++ syntax.

## Solution
The rewriter should avoid spanifying this code.

## Note
Additional errors are all related to the same issue of private member access, stemming from the problematic `std::to_array` usage.