# Build Failure Analysis: 2025_05_02_patch_64

## First error
../../media/muxers/mp4_muxer_box_writer_unittest.cc:1064:43: error: no viable conversion from 'const unsigned int *' to 'base::span<const unsigned int>'

## Category
Rewriter doesn't handle assignment of spanified variable from std::begin/end.

## Reason
The rewriter created a variable of type `base::span<const unsigned int>`, but is trying to initialize it with `std::begin(kSampleDurations)`. `std::begin` returns a pointer, not a span, so the compiler is complaining that it cannot convert from `const unsigned int *` to `base::span<const unsigned int>`.

## Solution
The rewriter should convert the `std::begin` and `std::end` to a span using the following pattern: `base::span(kSampleDurations)`.

## Note
The second error `cannot increment value of type 'base::span<const unsigned int>'` is caused by the use of the increment operator on the iterator. After spanifying the iterator, the code needs to access the element by using `iter[0]` instead of `*iter` to increment the underlying pointer.