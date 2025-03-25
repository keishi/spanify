# Build Failure Analysis: 2025_03_19_patch_985

## First error

../../third_party/libc++/src/include/array:553:17: error: static assertion failed due to requirement 'is_move_constructible_v<media::SineWaveAudioSource>': [array.creation]/4: to_array requires move constructible elements.
  553 |   static_assert(is_move_constructible_v<_Tp>, "[array.creation]/4: to_array requires move constructible elements.");
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter replaced an array with `std::to_array`. However `SineWaveAudioSource` is not move constructible because it contains a `base::Lock` which has a deleted copy constructor and move constructor. Because `std::to_array` returns a `std::array` by value, and the elements of the array must be move constructible. This requirement is enforced by a static assertion.
The original code used a C-style array which implicitly copy constructs each element when the array is initialized. Thus the original code required `SineWaveAudioSource` to be copy constructible, and the rewriter introduced a new requirement that is move constructible.

The `base::Lock` class in Chromium is not copyable or movable. Dropping the `mutable` qualifier during spanification makes the code no longer compile.

## Solution
The rewriter should detect when the code has a class that requires the `mutable` keyword, and ensure that it's preserved. An alternative solution is to avoid using `std::to_array` which requires move constructible types.

## Note
The other errors are follow-on errors from the same root cause.