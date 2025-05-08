# Build Failure Analysis: 2025_05_02_patch_968

## First error

../../net/filter/gzip_source_stream.cc:102:20: error: no viable conversion from 'IOBuffer' to 'base::span<char>'

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code is attempting to implicitly convert `*input_buffer` which is of type `IOBuffer` to `base::span<char>`. `IOBuffer` is not implicitly convertible to `base::span<char>`. The correct way to create a `base::span<char>` from an `IOBuffer` is to use `base::make_span(input_buffer->data(), input_buffer->size())`.

There are two other errors of type `reinterpret_cast from 'base::span<char>' to 'Cr_z_Bytef *' (aka 'unsigned char *') is not allowed`. `reinterpret_cast` is not allowed between `base::span<char>` to `unsigned char*`, the rewriter should have removed `reinterpret_cast` when spanifying the code.

## Solution
1. Rewriter needs to avoid implicit conversion from `IOBuffer` to `base::span<char>`, should use `base::make_span(input_buffer->data(), input_buffer->size())` instead.
2. Rewriter needs to be able to remove `reinterpret_cast` that is applied to a spanified variable.

## Note