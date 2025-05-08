# Build Failure Analysis: 2025_05_02_patch_445

## First error

../../net/spdy/spdy_buffer_unittest.cc:81:14: error: no matching constructor for initialization of 'SpdyBuffer'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code uses `SpdyBuffer` which has a constructor that takes a `const char*` and `size_t`. The rewriter changed `kData` from `const char[]` to `const std::string_view`. The rewriter changed `SpdyBuffer buffer(kData, kDataSize);` to use `kData` that is a string view, but there's no implicit conversion from `std::string_view` to `const char*`. It seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should replace `kData` with `kData.data()` to pass the raw pointer to the constructor.

## Note
The code also has an error where an `int` value is passed to subspan. The rewriter should cast this value to `size_t`.