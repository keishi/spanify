# Build Failure Analysis: 2025_03_16_patch_302

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('const base::span<int>' and 'const std::nullptr_t')
  229 | DEFINE_CHECK_OP_IMPL(EQ, ==)
      | ~~~~~~~~~~~~~~~~~~~~~~~~~^~~

## Category
Rewriter needs to initialize of spanified member field to {}.

## Reason
The rewriter replaced `int* wire_fds = nullptr;` with `base::span<int> wire_fds = {};`, which is correct. However, a `DCHECK_EQ(wire_fds, nullptr);` expression expects a pointer on the left, but now it's a span. Span does not have an overloaded operator to compare it with `nullptr`. The correct way to check if a span is empty is to use `wire_fds.empty()`.

## Solution
The rewriter should replace `DCHECK_EQ(wire_fds, nullptr);` with `DCHECK(wire_fds.empty());`.

## Note
The second error `no viable overloaded '='` is also related to span trying to assign pointer `reinterpret_cast<int*>(CMSG_DATA(cmsg))` to span. The rewriter should recognize CMSG_DATA and create a span using the pointer and the length.