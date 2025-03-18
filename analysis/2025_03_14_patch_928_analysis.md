# Build Failure Analysis: 2025_03_14_patch_928

## First error

../../content/renderer/skia_benchmarking_extension.cc:230:24: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to construct a span from the return value of a third_party function.

## Reason
The error occurs because the code attempts to implicitly convert the raw pointer `bitmap.getPixels()` (which is a `uint32_t*`) to a `base::span<uint32_t>`. This conversion fails because there's no implicit constructor for `base::span` that accepts a raw pointer directly. Furthermore, `bitmap.getPixels()` is a third party function so should not be rewritten by spanify tool.

## Solution
Since the function `bitmap.getPixels()` is a third party function, it shouldn't be rewritten. Instead the tool should emit a warning that the code needs to be fixed manually.

## Note
There's a secondary issue about `buffer.Data()` that triggers another error in the same function.