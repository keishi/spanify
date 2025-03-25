# Build Failure Analysis: 2025_03_19_patch_1569

## First error

../../net/spdy/spdy_session.cc:1329:23: error: no matching function for call to 'GetTotalSize'
 1329 |     size_t old_size = GetTotalSize(pending_create_stream_queues_);
      |                       ^~~~~~~~~~~~

## Category
Rewriter needs to update call sites when changing array types.

## Reason
The rewriter changed `pending_create_stream_queues_` from a C-style array to `std::array`. The function `GetTotalSize` is defined to take a C-style array as its parameter, but it was not updated by the rewriter to handle the `std::array`.

## Solution
The rewriter should update the call sites of `GetTotalSize` to pass `pending_create_stream_queues_.data()` and `.size()`, or to update `GetTotalSize` to accept `std::array`. Given that `GetTotalSize` is in the same file, the rewriter should update the definition of the function.

The new signature of GetTotalSize should be:
```c++
template <typename T, size_t N>
size_t GetTotalSize(const std::array<T, N>& arr) {
```

## Note
The other errors are the same root cause as the first error, just different lines.
```
../../net/spdy/spdy_session.cc:1336:25: error: no matching function for call to 'GetTotalSize'
 1336 |     DCHECK_GT(old_size, GetTotalSize(pending_create_stream_queues_));
      |                         ^~~~~~~~~~~~
../../base/check_op.h:272:55: note: expanded from macro 'DCHECK_GT'
  272 | #define DCHECK_GT(val1, val2) DCHECK_OP(GT, > , val1, val2)
      |                                                       ^~~~
../../base/check_op.h:255:26: note: expanded from macro 'DCHECK_OP'
  255 |                          val2)
      |                          ^~~~
../../base/check_op.h:175:26: note: expanded from macro 'CHECK_OP_FUNCTION_IMPL'
  175 |                 (val1), (val2),                                                \
      |                          ^~~~
../../net/spdy/spdy_session.cc:384:8: note: candidate template ignored: could not match 'T[N]' against 'std::array<PendingStreamRequestQueue, NUM_PRIORITIES>' (aka 'array<circular_deque<base::WeakPtr<SpdyStreamRequest>>, NUM_PRIORITIES>')
  384 | size_t GetTotalSize(const T (&arr)[N]) {
      |        ^
../../net/spdy/spdy_session.cc:2878:9: error: no matching function for call to 'GetTotalSize'
 2878 |         GetTotalSize(pending_create_stream_queues_));
      |         ^~~~~~~~~~~~