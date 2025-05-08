# Build Failure Analysis: 2025_05_02_patch_1298

## First error

../../media/gpu/vaapi/test/h264_decoder.cc:934:21: error: member reference type 'base::span<const H264ModificationOfPicNum>' is not a pointer; did you mean to use '.'?
  934 |     switch (list_mod->modification_of_pic_nums_idc) {
      |             ~~~~~~~~^~
      |                     .

## Category
Pointer passed into spanified function parameter.

## Reason
The code was originally written to use a pointer `list_mod` to access members of the `H264ModificationOfPicNum` struct. However, the spanify tool changed the type of `list_mod` to `base::span<const H264ModificationOfPicNum>`.  Spans are not pointers, so the `->` operator is no longer valid. The correct operator to access members of a struct within a span is `.`. Additionally, incrementing the span `++list_mod` is also invalid.

## Solution
The rewriter spanified the function parameter, but failed to account for the usage of the span. In `media/gpu/vaapi/test/h264_decoder.cc` and `media/gpu/h264_decoder.cc`, the code iterates through the span. The rewriter should change the code to iterate through the span using indices. The code should be rewritten as follows:

```c++
for (size_t i = 0; i < ref_list_mods.size(); ++i) {
  switch (ref_list_mods[i].modification_of_pic_nums_idc) {
    case 0:
      if (ref_list_mods[i].modification_of_pic_nums_idc == 0) {
        ...
        (static_cast<int>(ref_list_mods[i].abs_diff_pic_num_minus1) + 1);
        ...
}
```
The rewriter logic should identify places where the spanified variable is being accessed with `->` and rewrite those to `.`. The increment operator `++` used in the loop must also be rewritten to use indices.

## Note
The error occurs in both `media/gpu/h264_decoder.cc` and `media/gpu/vaapi/test/h264_decoder.cc`. Similar changes will need to be made in both files to correct the code. The patch also converted the type in `media/parsers/h264_parser.cc` and `media/parsers/h264_parser.h` which should be addressed with the same solution.