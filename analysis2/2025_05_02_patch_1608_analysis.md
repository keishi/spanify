# Build Failure Analysis: 2025_05_02_patch_1608

## First error

../../net/filter/brotli_source_stream_unittest.cc:85:46: error: no viable conversion from returned value of type 'value_type *' (aka 'char *') to function return type 'base::span<char>'
   85 |   base::span<char> encoded_buffer() { return &encoded_buffer_[0]; }
      |                                              ^~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to return a `char*` as a `base::span<char>`. `base::span` has no implicit constructor from raw pointer, it requires explicit construction.  The root cause is that the rewriter changed the return type of `encoded_buffer()` to `base::span<char>` but it did not update the return statement to properly construct a `base::span` object. Because a `base::span` requires size information, the rewriter must find a way to identify the size of the buffer being returned.

## Solution
The rewriter needs to generate code to explicitly construct a `base::span` from the raw pointer. The size of the `span` can be determined by using the known size of the internal buffer `encoded_buffer_`. The rewriter should generate code like this:

```c++
base::span<char> encoded_buffer() { return base::span(&encoded_buffer_[0], encoded_buffer_.size()); }
```

## Note
The log contains multiple errors all stemming from the same root cause.

The error related to `safe_conversions.h` is a secondary error, caused by the main issue and will be resolved when the first error is fixed.

There are multiple locations where the `encoded_buffer()` result is being passed to `source()->AddReadResult()`. These locations will need to be updated to call `.data()` since that third party function requires `const char*`, and implicit decay to a pointer is not possible.