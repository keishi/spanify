# Build Failure Analysis: 2025_03_19_patch_654

## First error

../../net/spdy/spdy_session.cc:3225:16: error: no matching function for call to 'GetTotalSize'
 3225 |     old_size = GetTotalSize(stream_send_unstall_queue_);
      |                ^~~~~~~~~~~~
../../net/spdy/spdy_session.cc:384:8: note: candidate template ignored: could not match 'T[N]' against 'std::array<base::circular_deque<spdy::SpdyStreamId>, NUM_PRIORITIES>' (aka 'array<circular_deque<unsigned int>, NUM_PRIORITIES>')
  384 | size_t GetTotalSize(const T (&arr)[N]) {
      |        ^

## Category
Rewriter needs to update function signature to work with `std::array` instead of C-style array.

## Reason
The rewriter changed `stream_send_unstall_queue_` from a C-style array to `std::array`. The `GetTotalSize` function is designed to work with C-style arrays. The rewriter didn't update `GetTotalSize` to work with `std::array`.

## Solution
Update the `GetTotalSize` function to work with `std::array`.
Change:
```c++
template <typename T, size_t N>
size_t GetTotalSize(const T (&arr)[N]) {
  size_t total_size = 0;
  for (size_t i = 0; i < N; ++i) {
    total_size += arr[i].size();
  }
  return total_size;
}
```

to:

```c++
template <typename T, size_t N>
size_t GetTotalSize(const std::array<T, N>& arr) {
  size_t total_size = 0;
  for (size_t i = 0; i < N; ++i) {
    total_size += arr[i].size();
  }
  return total_size;
}
```

## Note
The build failure log shows a similar error in line 3242. So the rewriter needs to update all call sites of `GetTotalSize`.