# Build Failure Analysis: 2025_03_16_patch_1952

## First error

../../third_party/blink/renderer/core/svg/svg_point_list.cc:75:12: error: no matching member function for call to 'Parse'
   75 |     return Parse(chars.data(), chars.data() + chars.size());
      |            ^~~~~

## Category
Rewriter needs to pass a span to a rewritten function.

## Reason
The rewriter changed the `Parse` function to take a `base::span<const CharType>` as argument. The code calling `Parse` needs to be updated to pass in the correct type. In this case it is calling `chars.data(), chars.data() + chars.size()` which are two pointers. The arguments passed to `Parse` used to match the signature before the rewriter touched it. Now a `base::span` needs to be constructed.

## Solution
Change the code to construct the span in the callsite. Use `base::span{chars.data(), chars.size()}` instead of `chars.data(), chars.data() + chars.size()`.

## Note
There is a second error where the code assumes `ptr` is a pointer by using `*ptr` and indexing `ptr[0]`. Both of these should be changed to use `ptr[index]` as a span can be accessed using bracket notation.