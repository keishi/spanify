# Build Failure Analysis: 2025_03_19_patch_1702

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:1076:9: error: cannot increment value of type 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to apply subspan rewrite to a spanified return value.

## Reason
The rewriter transformed the return type of `flush_diff8` to `base::span<uint8_t>`, but it did not update the increment expressions within the function to be compatible with `base::span`.  Specifically, the code uses the postfix increment operator `dst++` as if `dst` were a pointer, but `base::span` does not support this operation.

## Solution
The rewriter needs to be updated to transform pointer arithmetic operations on `base::span` variables into equivalent `subspan` operations. In this case, the post increment operator should have been changed to `dst = dst.subspan(1);`

## Note
The rest of the errors in the build log are of the same type, suggesting that the rewriter made a systematic error in handling `flush_diff8`. There is also a final error that results from attempting to perform pointer arithmetic on the return value: `return dst - origDst;`. This arithmetic should be performed on `.data()` instead.
```
../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:1148:14: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'uint8_t *const' (aka 'unsigned char *const'))
 1148 |   return dst - origDst;
      |          ~~~ ^ ~~~~~~~