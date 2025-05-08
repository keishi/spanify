# Build Failure Analysis: 2025_05_02_patch_1938

## First error

```
../../base/check_op.h:229:26: error: invalid operands to binary expression ('blink::LineInfo *const' and 'const std::array<blink::LineInfo, 0>')
  229 | DEFINE_CHECK_OP_IMPL(EQ, ==)
      | ~~~~~~~~~~~~~~~~~~~~~~~~~^~~
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error arises from an attempt to compare a `blink::LineInfo*` with a `std::array<blink::LineInfo, 0>`. This comparison occurs within a `CHECK_EQ` macro, which is likely used for debugging or assertion purposes.  The `LineInfoList` class contains a zero-sized array `line_infos_`, and a `CHECK_EQ` is performed on that member. Because `third_party/` is excluded from spanification, the rewriter should not attempt to change any code that would require spanifying code in `third_party/`.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code. Do not spanify `line_infos_` because it is inside the `third_party/` directory.

## Note
The original code contained a zero-sized array. The rewriter changed it to a `std::array` of size 0.
```c++
LineInfo line_infos_[0];
```
to
```c++
std::array<LineInfo, 0> line_infos_;