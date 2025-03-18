# Build Failure Analysis: 1

## First error

../../ui/events/ozone/evdev/stylus_button_event_converter_evdev_unittest.cc:124:54: error: invalid operands to binary expression ('base::span<struct input_event>' and 'long')
  124 |   int nwrite = HANDLE_EINTR(write(write_pipe_, queue + queue_index,
      |                                                ~~~~~ ^ ~~~~~~~~~~~
../../base/posix/eintr_wrapper.h:42:14: note: expanded from macro 'HANDLE_EINTR'
   42 |     decltype(x) eintr_wrapper_result;                        \
      |              ^
../../base/time/time.h:513:28: note: candidate function template not viable: no known conversion from 'base::span<struct input_event>' to 'TimeDelta' for 1st argument
  513 | inline constexpr TimeClass operator+(TimeDelta delta, TimeClass t) {
      |                            ^         ~~~~~~~~~~~~~~~

## Category
Rewriter needs to use .data() when `base::span` is used in pointer arithmetic.

## Reason
The code uses pointer arithmetic on a `base::span` object, which is not allowed. The `write` function expects a pointer as its second argument, but `queue + queue_index` attempts to perform pointer arithmetic directly on the `base::span` object `queue`.

## Solution
The rewriter should have added `.data()` to the `queue` variable to get the underlying pointer before performing pointer arithmetic.

```c++
int nwrite = HANDLE_EINTR(write(write_pipe_, queue.data() + queue_index,
```

## Note
The other errors are the same, so only the first one was analyzed.