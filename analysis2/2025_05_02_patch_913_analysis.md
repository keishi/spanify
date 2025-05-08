```
# Build Failure Analysis: 2025_05_02_patch_913

## First error

```
../../media/filters/h265_to_annex_b_bitstream_converter.cc:206:44: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'base::span<uint8_t>' (aka 'span<unsigned char>'))
  206 |       uint32_t output_bytes_used = outscan - output;
      |                                    ~~~~~~~ ^ ~~~~~~
```

## Category
Rewriter needs to apply subspan rewrite to a spanified return value.

## Reason
The code is trying to subtract two `base::span<uint8_t>` objects, `outscan` and `output`, to calculate the number of bytes used. This operation is not valid for spans. It seems that `output` was passed as argument as base::span but was later used as a pointer, probably to calculate the difference between addresses. It should not have been spanified.

## Solution
The rewriter should not rewrite `output` to a span, or it should create two local variables where one of the variables is the span and the other is a pointer to the first element of the span. This way the pointer can be used for pointer arithmetic.

## Note
Other errors in the log indicate similar problems:

*   Spans cannot be incremented using `++` (line 241).
*   `subspan` is being used incorrectly (line 248).
*   `subspan` is likely conflicting with other replacements.