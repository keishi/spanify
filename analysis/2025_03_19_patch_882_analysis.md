# Build Failure Analysis: 2025_03_19_patch_882

## First error

../../net/filter/zstd_source_stream_unittest.cc:94:40: error: no viable conversion from returned value of type 'net::IOBufferWithSize' to function return type 'base::span<char>'

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter changed `char* out_data()` to return `base::span<char>`. The rewriter failed to recognize raw pointer return value from `net::IOBufferWithSize` is being converted to `base::span<char>`. The size was also not specified which is why the compiler complains about no viable conversion.

## Solution
Rewriter needs to apply `.data()` to the return value.
Original:
```c++
  char* out_data() { return out_buffer_->data(); }
```

New:
```c++
  base::span<char> out_data() { return base::span(out_buffer_->data(), out_buffer_size()); }
```

## Note
There is also another location that needs to be fixed with the same technique at
`net/filter/zstd_source_stream_unittest.cc:186`.