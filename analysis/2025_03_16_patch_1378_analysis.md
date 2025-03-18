# Build Failure Analysis: 2025_03_16_patch_1378

## First error

../../remoting/codec/codec_test.cc:137:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `GetFrameDataAtPos` (a third-party function) to a `base::span<const uint8_t>`. This fails because there's no automatic conversion from a raw pointer to a span; a span needs to be constructed explicitly. The size information needed to construct the span is also not available. The spanified type is `base::span<const uint8_t>`, but the rewriter didn't construct the object with a size.

## Solution
The rewriter needs to generate code to explicitly construct a `base::span` from the raw pointer returned by `frame_->GetFrameDataAtPos`. Since the size is determined by `i.rect().width()`, this value can be used in the span constructor. However the GetFrameDataAtPos function should also return the stride so we can pass this information too.

The corrected code would be:
```c++
      base::span<const uint8_t> actual = base::span<const uint8_t>(
          frame_->GetFrameDataAtPos(i.rect().top_left()), i.rect().width());
```

## Note
There are additional errors that occur after the first one that also need to be addressed:
1.  `../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'` - This is because the argument to `subspan()` needs to be cast to `size_t`. The rewriter should add the cast. This is fixed by adding `static_cast<size_t>` before the argument. This is the same as "Rewriter needs to cast argument to base::span::subspan() to an unsigned value."
2.  `../../remoting/codec/codec_test.cc:163:50: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')` - This is because the code attempts to increment the span instead of accessing the underlying pointer. This can be resolved by using a pointer and incrementing pointer as the original code or change the code to use span correctly by doing index access. The former is easier for the rewriter to generate.

```c++
const uint8_t* actual = frame_->GetFrameDataAtPos(i.rect().top_left());
for (int y = 0; y < i.rect().height(); ++y) {
    for (int x = 0; x < i.rect().width(); ++x) {
        double error = static_cast<double>(*original++) -
                       static_cast<double>(*(actual++));