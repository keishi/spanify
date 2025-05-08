# Build Failure Analysis: 2025_05_02_patch_1479

## First error

../../content/browser/byte_stream_unittest.cc:47:22: error: no viable conversion from 'net::IOBufferWithSize' to 'base::span<char>'
   47 |     base::span<char> bufferp = *buffer;
      |                      ^         ~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The `IOBufferWithSize` does not have a conversion operator to `base::span<char>`. `IOBufferWithSize` is a ref counted type that manages a memory allocation. Spanifying this kind of code would require replacing the `IOBufferWithSize` with an owned type like `std::unique_ptr` or a collection.

## Solution
Don't spanify `IOBufferWithSize`.