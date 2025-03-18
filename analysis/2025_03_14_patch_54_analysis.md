# Build Failure Analysis: 2025_03_14_patch_54

## First error

../../remoting/codec/codec_test.cc:115:33: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  115 |       base::span<const uint8_t> decoded =
      |                                 ^
  116 |           frame_->GetFrameDataAtPos(i.rect().top_left());
      |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The `GetFrameDataAtPos` function (likely from a third-party library) returns a `uint8_t*`, and the rewriter expected this to be compatible with constructing a `base::span<const uint8_t>`. However, there is no implicit conversion. The rewriter should have generated code to explicitly construct a span from the pointer.  Also the size of the return value is unknown.

## Solution
The rewriter needs to generate the code to explicitly construct a span from the return value of `GetFrameDataAtPos`, however the length of the span is unknown. This can be fixed by using UNSAFE_BUFFERS as a parameter to the span or prompting the user to specify the size of the buffer.

For example:

```c++
base::span<const uint8_t> decoded(frame_->GetFrameDataAtPos(i.rect().top_left()), UNSAFE_BUFFERS);
```

or:

```c++
base::span<const uint8_t> decoded(frame_->GetFrameDataAtPos(i.rect().top_left()), <# size #>);
```

## Note
Also there is a secondary error reported for the subspan function because the .data() call was not added to the span that is calling that function, to avoid another implicit pointer cast.