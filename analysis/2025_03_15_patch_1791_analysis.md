# Build Failure Analysis: 2025_03_15_patch_1791

## First error

../../remoting/codec/codec_test.cc:113:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign a `uint8_t*` returned by the `GetFrameDataAtPos` method to a `base::span<const uint8_t>`. The compiler can't implicitly convert a raw pointer to a span. This error occurred because the rewriter didn't generate the necessary code to construct a `base::span` from the raw pointer returned by the third-party `GetFrameDataAtPos()` function. The spanify tool attempted to directly assign `uint8_t*` to `base::span<const uint8_t>`, but this requires explicit construction of span. The return value is third party, so we cannot rewrite that return.

## Solution
Construct a `base::span` from the raw pointer returned by `GetFrameDataAtPos()`. Need to create a `span` from the returned pointer and a size. Unfortunately, the size of the returned pointer isn't known at that location so a full fix is impossible, but we can insert the subspan initialization and leave a comment to help the developer. Note that we need to create a temporary variable before the existing variable and assign the new span to it.

## Note
The other error relates to strict_cast. The `strict_cast` error indicates an implicit conversion from `int` to `unsigned long` is invalid.