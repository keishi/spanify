# Build Failure Analysis: 2025_03_19_patch_1089

## First error

../../base/strings/latin1_string_conversions.cc:19:61: error: invalid operands to binary expression ('base::span<const Latin1Char>' (aka 'span<const unsigned char>') and 'size_t' (aka 'unsigned long'))
   19 |     return UNSAFE_TODO(std::u16string(latin1.data(), latin1 + length));
      |                                                      ~~~~~~ ^ ~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code `latin1 + length` attempts to add a `base::span` with a `size_t`.  However, when `latin1` is converted to `base::span`, `latin1` is no longer a raw pointer, but a `base::span`. Therefore pointer arithmetic will not work. `latin1 + length` should be `latin1.data() + length`, but it seems the rewriter didn't recognize this case where the `latin1` value was spanified.

## Solution
When the rewriter spanifies an argument, and that argument is later added to an integer, the rewriter should add `.data()` before the spanified value.

## Note
No notes.