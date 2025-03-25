# Build Failure Analysis: 2025_03_19_patch_1005

## First error

../../ui/base/x/x11_clipboard_helper.cc:340:13: error: reinterpret_cast from 'std::vector<uint8_t>' (aka 'vector<unsigned char>') to 'const x11::Atom *' is not allowed
  340 |             reinterpret_cast<const x11::Atom*>(data);
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter replaced the `data.data()` call with just `data` which represents `std::vector<uint8_t>`. Then it left a reinterpret_cast. The rewriter should either not have spanified it, or been able to remove the cast.

## Solution
The rewriter needs to avoid spanifying `data` if it is being used in a `reinterpret_cast`. Or when spanifying, also fixup the `reinterpret_cast` appropriately.

## Note
This would be `Rewriter needs to remove reinterpret_cast on spanified variable`, but it looks like it was spanified unintentionally, so the `avoid spanifying` wording is more accurate.