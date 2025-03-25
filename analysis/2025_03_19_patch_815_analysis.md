# Build Failure Analysis: 2025_03_19_patch_815

## First error

../../mojo/core/ipcz_driver/mojo_trap.cc:613:20: error: no viable conversion from 'MojoTrapEvent *' to 'base::span<MojoTrapEvent>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified the `Arm` function to take base::span as an argument, but failed to recognize a size info unavailable raw pointer. In this case, `blocking_events` is a raw pointer, and the size information was determined by `event_capacity`. The rewriter needs to be able to create a span at the call site from the raw pointer.

## Solution
The rewriter needs to be able to construct a span from a raw pointer at call sites, where the size is available but not directly attached to the raw pointer. The rewriter should generate code to create a `base::span` from `blocking_events` and `event_capacity` before passing it to the `Arm` function. The generated code would look like this:
```c++
base::span<MojoTrapEvent> blocking_events_span(blocking_events, event_capacity);
  return trap->Arm(blocking_events_span, num_blocking_events);
```

## Note
The related code is:
```c++
MojoResult MojoTrap::Arm(base::span<MojoTrapEvent> blocking_events,
                          uint32_t* num_blocking_events) {
  const uint32_t event_capacity =
      num_blocking_events ? *num_blocking_events : 0;
  if (event_capacity > 0 && blocking_events.empty()) {
    return MOJO_RESULT_INVALID_ARGUMENT;
  }