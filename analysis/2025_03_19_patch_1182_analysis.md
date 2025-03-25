```
# Build Failure Analysis: 2

## First error
```
../../net/filter/gzip_source_stream_unittest.cc:83:5: error: no matching function for call to 'CompressGzip'
   83 |     CompressGzip(source_data_, source_data_len_, encoded_data_,
      |     ^~~~~~~~~~~~
```

## Category
Rewriter failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `source_data_` to `std::array`, but it is being passed to third party code `CompressGzip`. The rewriter should recognize this pattern and add `.data()`. The first argument to `CompressGzip` needs to be a `char*` but is now `std::array<char, kBigBufferSize>`.

## Solution
The rewriter should add `.data()` when a spanified or arrayified variable is passed to a third_party function call.

```diff
--- a/net/filter/gzip_source_stream_unittest.cc
+++ b/net/filter/gzip_source_stream_unittest.cc
   83 |     CompressGzip(source_data_, source_data_len_, encoded_data_,
      |     ^~~~~~~~~~~~
+  83 |     CompressGzip(source_data_.data(), source_data_len_, encoded_data_,
      |     ^~~~~~~~~~~~

```

## Note
It looks like all calls to `CompressGzip` will need to add `.data()`. This pattern is likely used many times in the Chromium source code. It seems like the rewriter should try to identify when `CompressGzip` is being called and automatically add `.data()`.