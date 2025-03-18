# Build Failure Analysis: 2025_03_14_patch_1109

## First error

../../net/spdy/spdy_session.cc:3225:16: error: no matching function for call to 'GetTotalSize'
 3225 |     old_size = GetTotalSize(stream_send_unstall_queue_);
      |                ^~~~~~~~~~~~

## Category
Rewriter needs to rewrite function parameter to accept `std::array` instead of `T[]`.

## Reason
The rewriter transformed the `stream_send_unstall_queue_` member from a C-style array to a `std::array`. The `GetTotalSize` function expects a C-style array as input. Since there's no implicit conversion from `std::array` to a C-style array, the compiler throws an error.

## Solution
The rewriter should modify the `GetTotalSize` function to accept a `std::array` instead of a C-style array, like this:

```c++
template <typename T, size_t N>
size_t GetTotalSize(const std::array<T, N>& arr) {
  size_t total_size = 0;
  for (const auto& element : arr) {
    total_size += element.size();
  }
  return total_size;
}
```

## Note
The same error appears on line 3242.
```
../../net/spdy/spdy_session.cc:3242:17: error: no matching function for call to 'GetTotalSize'
 3242 |       DCHECK_LT(GetTotalSize(stream_send_unstall_queue_), old_size);
      |                 ^~~~~~~~~~~~