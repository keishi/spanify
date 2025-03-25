# Build Failure Analysis: 2025_03_19_patch_1870

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^
../../gin/array_buffer.h:63:20: note: in instantiation of template class 'base::span<void>' requested here
   63 |   base::span<void> bytes() const {
      |                    ^

## Category
Rewriter needs to avoid spanifying function if it requires spanifying excluded code.

## Reason
The rewriter is trying to spanify gin::ArrayBuffer::bytes(). However, the element type is void, and the span library does not support void element type. The function gin::ArrayBuffer::bytes() should not have been spanified in the first place because it required rewriting gin code, which is third party.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
Multiple errors are present in the log because the rewriter has modified gin::ArrayBufferView::bytes() as well.