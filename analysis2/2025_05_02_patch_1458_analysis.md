# Build Failure Analysis: 2025_05_02_patch_1458

## First error

../../media/gpu/h265_decoder.cc:286:55: error: no viable conversion from 'pointer' (aka 'media::H265SliceHeader *') to 'base::span<H265SliceHeader>'
  286 |                   *curr_nalu_, curr_slice_hdr_.get(), last_slice_hdr_.get());

## Category
Pointer passed into spanified function parameter.

## Reason
The function `H265Parser::ParseSliceHeader` was spanified to take `base::span<H265SliceHeader>` as its third argument (`prior_shdr`). However, at the call site in `H265Decoder::DecodeNALU`, a raw pointer (`last_slice_hdr_.get()`) is being passed.  There's no implicit conversion from a raw pointer to a `base::span` without size information.

## Solution
The rewriter spanified a function, but failed to spanify a call site. Need to wrap raw pointer with base::span.

```
        res = parser_.ParseSliceHeader(*curr_nalu_, curr_slice_hdr_.get(),
                                      base::span<H265SliceHeader>(last_slice_hdr_.get(), 1u));
```

## Note
There is another similar error in `../../media/gpu/h265_decoder.cc:368:46`.