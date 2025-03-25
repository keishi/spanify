# Build Failure Analysis: 2025_03_19_patch_445

## First error

../../remoting/codec/codec_test.cc:137:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  137 |       base::span<const uint8_t> actual =
      |                                 ^
  138 |           frame_->GetFrameDataAtPos(i.rect().top_left());
      |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the return value of `frame_->GetFrameDataAtPos` directly to a `base::span<const uint8_t>`. However, `GetFrameDataAtPos` returns a raw pointer `uint8_t*`, and the rewriter didn't generate the necessary code to construct a `base::span` from that raw pointer. The error message "no viable conversion from 'uint8_t *' to 'base::span<const uint8_t>'" clearly indicates this missing conversion.  The size information for creating the span isn't readily available at the assignment site.

## Solution
The rewriter needs to generate code that constructs a `base::span` from the raw pointer returned by `frame_->GetFrameDataAtPos`. Since the size isn't clear, the generated code should require the user to provide the size. There are two possible solutions. If the stride is the size, it could use that. But it seems too presumptuous to assume that is the case.

Option 1:
```c++
base::span<const uint8_t> actual =
    base::span(frame_->GetFrameDataAtPos(i.rect().top_left()), <# size #>);
```

Option 2:
```c++
base::span<const uint8_t> actual =
    base::make_span(frame_->GetFrameDataAtPos(i.rect().top_left()), <# size #>);
```

## Note
There are also errors related to incrementing `base::span`. The rewriter converted `actual` to `base::span`, but did not update the pointer arithmetic.

```
../../remoting/codec/codec_test.cc:163:50: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  163 |                      static_cast<double>((decoded++)[0]);
      |                                           ~~~~~~~^
../../remoting/codec/codec_test.cc:168:12: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  168 |     decoded++;
      |     ~~~~~~~^
```