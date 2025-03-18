# Build Failure Analysis: 2025_03_14_patch_1650

## First error

../../ui/events/devices/x11/device_data_manager_x11.cc:402:11: error: cannot increment value of type 'base::span<const x11::Input::Fp3232>'
  402 |           ++valuators;
      |           ^ ~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter replaced `x11::Input::Fp3232* valuators = xiev->axisvalues.data();` with `base::span<const x11::Input::Fp3232> valuators = xiev->axisvalues;`. The original code uses pointer arithmetic to increment `valuators`. Incrementing a span is not a valid operation. Also this file includes `#ifdef UNSAFE_BUFFERS_BUILD`. The span rewrite in this file was incorrect.

## Solution
The rewriter should avoid rewriting functions and methods that cause rewriting of the code in exclude paths.

## Note
The include of `base/containers/span.h` was automatically inserted by the rewriter.