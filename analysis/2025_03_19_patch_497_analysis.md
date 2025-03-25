# Build Failure Analysis: 2025_03_19_patch_497

## First error

../../base/debug/dwarf_line_no.cc:1159:44: error: invalid operands to binary expression ('char *' and 'base::span<char>')
 1159 |   out_pos = static_cast<size_t>(result.ptr - out);
      |                                 ~~~~~~~~~~ ^ ~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code uses `std::to_chars` which returns a `std::to_chars_result` struct with a pointer `ptr` to the end of the written range. The code then calculates the offset by subtracting the beginning of the output buffer `out` from the pointer `result.ptr`. The rewriter spanified `out`, so the expression `result.ptr - out` is no longer valid. The `base::span` no longer supports pointer arithmetic so cannot be used in pointer subtractions directly.

## Solution
The correct way to calculate the offset after rewriting `out` to span, would be to add `.data()` to `out` so that pointer arithmetic will produce the same result. Thus change `result.ptr - out` to `result.ptr - out.data()`.

## Note
The same issue is present at line 1169 of the same file. The same fix can be applied to fix the problem there.