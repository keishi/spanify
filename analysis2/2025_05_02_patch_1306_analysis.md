# Build Failure Analysis: 2025_05_02_patch_1306

## First error

../../media/gpu/h264_decoder.cc:248:24: error: use of undeclared identifier 'ref_pic_marking'
  248 |                       (ref_pic_marking.size() *
      |                        ^~~~~~~~~~~~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `slice_hdr->ref_pic_marking`, but also tried to use it's `.size()` and `decltype` when `slice_hdr` was not touched by the rewriter. Therefore it shouldn't have been attempting to use methods of an arrayified variable.

## Solution
The rewriter should not modify the code unless the variables in the code were spanified/arrayified.

## Note