# Build Failure Analysis: 2025_03_14_patch_1574

## First error

../../chrome/browser/icon_transcoder/svg_icon_transcoder.cc:110:41: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  110 |   GURL data_url(kSvgDataUrlPrefix.data().subspan(base64_svg));
      |                 ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code attempts to call `.subspan()` on `kSvgDataUrlPrefix.data()`, where `kSvgDataUrlPrefix` has been converted to `std::array`. However, `.data()` returns a raw pointer, and `.subspan()` is not a member of raw pointers. The rewriter forgot to add `.data()` to `base64_svg` so it can concatenate with `std::string`.

## Solution
The rewriter needs to add `.data()` when arrayifying `base64_svg` so it can pass to the `GURL` constructor.
```c++
GURL data_url(kSvgDataUrlPrefix.data() + base64_svg.data());
```

## Note
This error is similar to "Rewriter needs to add .data() to arrayified `char[]` variable used with std::string."