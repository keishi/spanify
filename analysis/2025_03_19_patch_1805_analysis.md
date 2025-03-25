# Build Failure Analysis: 2025_03_19_patch_1805

## First error

../../media/filters/h26x_annex_b_bitstream_builder_unittest.cc:29:8: error: cannot increment value of type 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
In `GetDataFromBuffer`, the rewriter spanified `ptr`, but didn't rewrite the `ptr++` statement to be compatible with the span. The `ptr` variable is of type `base::span<const uint8_t>`, which does not support incrementing the span itself. Instead the code should index into the span, or use `.subspan` to create a new span.

## Solution
The rewriter needs to stop rewriting code that involves `base::span++`.

## Note
The same error happens on line 35 as well.