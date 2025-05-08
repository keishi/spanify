# Build Failure Analysis: 2025_05_02_patch_44

## First error

../../ui/base/x/x11_clipboard_helper.cc:340:13: error: reinterpret_cast from 'std::vector<uint8_t>' (aka 'vector<unsigned char>') to 'const x11::Atom *' is not allowed
  340 |             reinterpret_cast<const x11::Atom*>(data);
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The variable `data` which is a `std::vector<uint8_t>` was not rewritten to a span by the rewriter, yet the code was changed to reinterpret cast it. The error message states a reinterpret cast from a vector to a pointer is not allowed.

## Solution
The rewriter should not have changed the variable to a `span` and then left the `reinterpret_cast`. The code needs to determine how to get a pointer from the underlying data of a spanified variable if that is the intention of the code.

## Note