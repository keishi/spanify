# Build Failure Analysis: 2025_03_14_patch_1698

## First error

../../ui/base/l10n/formatter.cc:380:26: error: implicit conversion changes signedness: 'int' to 'size_type' (aka 'unsigned long') [-Werror,-Wsign-conversion]
  380 |       formatter_[format][length].reset();

## Category
Rewriter needs to use checked types with array access.

## Reason
The loop variables `format` and `length` are declared as ints, but they are being used to index the `formatter_` array, which uses `size_t` for indexing. This can cause a sign conversion warning/error if `format` or `length` are negative. It is also poor style to use `int` where `size_t` is more appropriate.

## Solution
Change type of `format` and `length` to `size_t`.

## Note
There is a second similar error.