# Build Failure Analysis: 2025_03_14_patch_920

## First error

../../chrome/browser/devtools/device/usb/android_usb_browsertest.cc:293:35: error: cannot cast from type 'const std::string' (aka 'const basic_string<char>') to pointer type 'unsigned char *'

## Category
Rewriter needs to account for existing casts to `unsigned char*` when spanifying.

## Reason
The rewriter is blindly replacing `unsigned char* x = (unsigned char*)data.data();` with `base::span<unsigned char> x = (unsigned char*)data;`. The problem is that `data` is a `std::string`, which can't be directly cast to a `base::span<unsigned char>`. Additionally, after the first error, the rewriter attempts to increment x++ on a span, which is also not supported. The tool should instead add .data() to `data` when casting.

## Solution
The rewriter should output `base::span<unsigned char> x = (unsigned char*)data.data();` and then correctly use `x[0]` instead of `(x++)[0]`.

## Note
The second error was a consequence of the first error.