# Build Failure Analysis: 2025_03_19_patch_164

## First error

../../ui/events/ozone/evdev/tablet_event_converter_evdev_unittest.cc:401:54: error: invalid operands to binary expression ('base::span<struct input_event>' and 'long')
  401 |   int nwrite = HANDLE_EINTR(write(write_pipe_, queue + queue_index,

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MockTabletEventConverterEvdev::ConfigureReadMock` was spanified. But the call site in `MockTabletEventConverterEvdev::MockTabletEventConverterEvdev` is using pointer arithmetics which is not allowed.

## Solution
The rewriter spanified a function, but failed to spanify a call site.

## Note