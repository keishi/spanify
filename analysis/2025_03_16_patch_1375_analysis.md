# Build Failure Analysis: 2025_03_16_patch_1375

## First error

../../remoting/codec/codec_test.cc:115:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code is assigning the return value of `frame_->GetFrameDataAtPos` to a `base::span`, however the return value is `uint8_t*`. The rewriter doesn't generate code to create a span from a raw pointer return value. It needs to deduce the size of the return value.

## Solution
The rewriter needs to generate a proper span construction at the assignment. The rewriter can use getFrameDataAtPos to construct a span from the raw pointer with calculated width and height. But size information is not locally available.

Example:
```c++
-      const uint8_t* decoded = frame_->GetFrameDataAtPos(i.rect().top_left());
+      base::span<const uint8_t> decoded = base::span(frame_->GetFrameDataAtPos(i.rect().top_left()),kBytesPerPixel * i.rect().width() * i.rect().height());
```

## Note
The second error `../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'` is caused by using `int` for frame_->stride(), but span's subspan wants an `unsigned long`. This is a secondary error.

```c++
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../remoting/codec/codec_test.cc:122:35: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  122 |         decoded = decoded.subspan(frame_->stride());
      |                                   ^

```

The rewriter needs to cast argument to base::span::subspan() to an unsigned value.