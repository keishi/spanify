# Build Failure Analysis: 2025_05_02_patch_792

## First error

../../media/gpu/vaapi/vaapi_jpeg_decoder.cc:88:12: error: use of undeclared identifier 'code_length'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is trying to access `code_length` inside the `static_assert`, which is out of scope. `code_length` is a member of the JpegHuffmanTable struct and it has been rewritten to use std::array. The rewriter incorrectly attempts to use `code_length.size()` as part of the static assert, but doesn't know how to get there. Additionally, the static assert is no longer valid after the rewrite.

## Solution
The rewriter should not modify code inside static asserts. It is not possible to access a local variable in the `FillHuffmanTable` function from inside the static assert. The static assert should have been left alone.

## Note
The other errors are follow-on errors, caused by the incorrect `static_assert`.