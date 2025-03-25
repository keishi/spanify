# Build Failure Analysis: 2025_03_19_patch_1911

## First error

../../media/filters/wsola_internals.cc:366:23: error: member reference base type 'float[3]' is not a structure or union
  366 |     memmove(similarity.data(), &similarity[1], 2 * sizeof(similarity[0]));
      |             ~~~~~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The code `memmove(similarity.data(), &similarity[1], 2 * sizeof(similarity[0]));` fails to compile because `similarity` is a `float[3]` C-style array, not a class or struct, so it doesn't have a `.data()` member. The rewriter incorrectly added `.data()` to `similarity` despite not converting `similarity` to a `std::array` or `base::span`.

## Solution
The rewriter should only add `.data()` to spanified or arrayified variables, or members. It should not be adding `.data()` to unrelated code.

## Note
The parameter `const float* y_values` in `QuadraticInterpolation` was correctly spanified to `base::span<const float> y_values`.