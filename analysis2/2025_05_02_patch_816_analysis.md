# Build Failure Analysis: 2025_05_02_patch_816

## First error

../../media/gpu/vaapi/vaapi_utils.cc:33:17: error: static assertion failed due to requirement 'std::is_array<const std::array<unsigned char, 4>>::value': Second parameter must be an array
   33 |   static_assert(std::is_array<From>::value,
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter changed `ehdr->y_mode_probs` from an array to `std::array`. Then in the `ParseIntraProbs` function, the rewriter changes `memcpy(curr_entropy_hdr_.y_mode_probs, ehdr->y_mode_probs,` to `memcpy(curr_entropy_hdr_.y_mode_probs.data(), ehdr->y_mode_probs.data(),`. The `data()` call on the second parameter of `memcpy` broke the code. A template function `media::(anonymous namespace)::CheckedMemcpy` expects the second argument to be an array, but it received an `std::array`.

## Solution
The rewriter needs to avoid adding the `.data()` call when the parameter is passed to a template function that expects an array type.

## Note
There were no other errors in this build failure log.