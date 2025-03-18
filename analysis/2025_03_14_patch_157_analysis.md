# Build Failure Analysis: 2025_03_14_patch_157

## First error

../../ui/events/ozone/evdev/tablet_event_converter_evdev_unittest.cc:401:54: error: invalid operands to binary expression ('base::span<struct input_event>' and 'long')
  401 |   int nwrite = HANDLE_EINTR(write(write_pipe_, queue + queue_index,

## Category
Rewriter needs to generate .data() to access the underlying pointer from span in pointer arithmetic.

## Reason
The rewriter has spanified the `queue` variable, which is now of type `base::span<struct input_event>`. The expression `queue + queue_index` is attempting to perform pointer arithmetic on the span object itself, which is not a valid operation. The `write` function expects a raw pointer, but it's receiving a span object. The correct way to access the underlying pointer from the span is to use `.data()`.

## Solution
The rewriter needs to be updated to recognize pointer arithmetic operations (like `queue + queue_index`) on spanified variables and automatically insert `.data()` at the appropriate place in the expression.

```c++
// The rewriter should produce the following code:
int nwrite = HANDLE_EINTR(write(write_pipe_, queue.data() + queue_index,
                                  sizeof(struct input_event) * read_this_many));
```

## Note
The code also fails a second time with the same error in the macro `HANDLE_EINTR`. But it is the same root cause.