# Build Failure Analysis: 2025_03_19_patch_477

## First error

../../media/gpu/vaapi/test/vp8_decoder.cc:29:17: error: static assertion failed due to requirement 'std::is_array<const std::array<unsigned char, 3>>::value': Second parameter must be an array
   29 |   static_assert(std::is_array<From>::value,
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying variables if it results in invalid template arguments.

## Reason
The code has a static assert that requires `From` to be an array. `From` is `const std::array<unsigned char, 3>`. Since `std::array` is a class, the static assert fails. This means we shouldn't have spanified this parameter.

## Solution
The rewriter should avoid spanifying this parameter.

## Note
The relevant code is in `media/gpu/vaapi/test/vp8_decoder.cc`.