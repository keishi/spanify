# Build Failure Analysis: 2025_05_02_patch_38

## First error

../../net/filter/zstd_source_stream_unittest.cc:100:46: error: no viable conversion from returned value of type 'value_type *' (aka 'char *') to function return type 'base::span<char>'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified the `encoded_buffer()` function, but failed to add `.data()` to the return value. This caused the compiler to complain that it cannot convert `char*` to `base::span<char>`. The return value should be converted to `base::span<char>` like `return &encoded_buffer_[0].data();`.

## Solution
The rewriter should add `.data()` to the return value of the spanified function.

## Note
The other errors are also related to missing `.data()` calls. Also the subspan needs to cast to an unsigned integer.