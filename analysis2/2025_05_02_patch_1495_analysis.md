# Build Failure Analysis: 2025_05_02_patch_1495

## First error

../../ui/events/ozone/evdev/stylus_button_event_converter_evdev_unittest.cc:125:54: error: invalid operands to binary expression ('base::span<struct input_event>' and 'long')

## Category
Rewriter needs to add .data() to arrayified function parameter used with pointer arithmetic.

## Reason
The rewriter converted the `input_event* queue` to `base::span<struct input_event> queue`. However the code is using pointer arithmetic with `queue + queue_index`. This does not work anymore because you cannot add an integer to a `base::span`. The correct code is to use `queue.data() + queue_index`.

## Solution
The rewriter needs to add `.data()` when pointer arithmetic is being performed. The correct code would be `queue.data() + queue_index`.

## Note
```c++
void MockStylusButtonEventConverterEvdev::ConfigureReadMock(
    base::span<struct input_event> queue,
    long read_this_many,
    long queue_index) {
  int nwrite = HANDLE_EINTR(write(write_pipe_, queue + queue_index,
                                   sizeof(struct input_event) * read_this_many));