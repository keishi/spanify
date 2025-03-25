# Build Failure Analysis: 2025_03_19_patch_664

## First error

../../ui/base/l10n/formatter.h:28:1: error: [chromium-style] Complex class/struct needs an explicit out-of-line destructor.
   28 | class Formatter {
      | ^

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter added `#include <array>` in a header file which triggers a complex class style check, requiring a destructor that is not there.

## Solution
This is not a rewriter bug, but a style error. Remove the generated code by the rewriter.

## Note
There's actually only one error in the log so no extra notes.