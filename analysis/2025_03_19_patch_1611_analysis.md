# Build Failure Analysis: 2025_03_19_patch_1611

## First error

../../net/websockets/websocket_inflater.cc:106:25: error: no viable conversion from 'char *' to 'base::span<char>'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `WebSocketInflater::OutputBuffer::Read`, but failed to update the call site in `WebSocketInflater::Inflate`. The code is attempting to pass `char*` to the spanified parameter `base::span<char>`, but it is not implicitly constructible. The root cause is a failure to spanify the call site.

## Solution
The rewriter needs to update call sites to spanified functions. Since the rewriter spanified the `Read` function, it should have also updated the call site at `WebSocketInflater::Inflate`. The fix depends on how the buffer pointer is managed. If `buffer` is expected to be `std::vector<char>`, then a `base::span` can be created from the underlying data and length. The size was already passed into the Read function which makes it easy to pass it in.
```c++
    output_buffer_.Read(base::span(&buffer->data()[num_bytes_copied], num_bytes_to_copy), num_bytes_to_copy);
```
If `buffer` is not a `std::vector<char>`, then it should be updated to be of that type first.

## Note
The rewriter successfully spanified the function signature of `WebSocketInflater::OutputBuffer::Read`, but it did not propagate these changes to the call site within the `WebSocketInflater::Inflate` method. The fix must convert `&buffer->data()[num_bytes_copied]` to a `base::span<char>` before passing it to the function.