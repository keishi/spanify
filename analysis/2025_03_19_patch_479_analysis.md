# Build Failure Analysis: 2025_03_19_patch_479

## First error

../../media/gpu/vaapi/test/vp8_decoder.cc:29:17: error: static assertion failed due to requirement 'std::is_array<const std::array<std::array<unsigned char, 19>, 2>>::value': Second parameter must be an array
   29 |   static_assert(std::is_array<From>::value,
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The original code expected `kDefaultMVProbs` to be a C-style array so the rewriter generated this `memcpy(curr_entropy_hdr_.mv_probs, kDefaultMVProbs, ...)` But because `curr_entropy_hdr_.mv_probs` was converted to `std::array` this became invalid code.

## Solution
Rewriter needs to be able to remove reinterpret_cast or related conversion that is appled to a spanified variable.

## Note
Extra errors:
```
../../media/parsers/vp8_parser.cc:835:30: error: no matching function for call to 'memcpy'
        memcpy(curr_entropy_hdr_.mv_probs.data(), ehdr->mv_probs.data(),