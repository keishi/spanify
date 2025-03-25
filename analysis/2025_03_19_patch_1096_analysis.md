# Build Failure Analysis: 2025_03_19_patch_1096

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('blink::LineInfo *const' and 'const std::array<blink::LineInfo, 0>')

## Category
Rewriter needs to avoid using CHECK_OP on C-style arrays converted to std::array.

## Reason
The rewriter converted a C-style array member to `std::array`. The code has a `CHECK_EQ` that compares the raw C-style array with a `std::array`. The compiler cannot find a viable `operator==` to compare `blink::LineInfo *const` with `const std::array<blink::LineInfo, 0>`. The type conversion prevents the code from compiling. The rewriter shouldn't arrayify variables used inside CHECK_OP macro.

## Solution
The rewriter should avoid applying `std::array` conversion on variables used with `CHECK_OP` macro calls.

## Note
The error happens in `CHECK_EQ`, so the rewriter should special case this macro when deciding to convert an array to `std::array`.