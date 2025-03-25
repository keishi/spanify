# Build Failure Analysis: 2025_03_19_patch_962

## First error

../../ui/events/test/event_generator.cc:497:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'
  497 | void EventGenerator::GestureMultiFingerScrollWithDelays(
      |                      ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/events/test/event_generator.h:111:7: note: EventGenerator defined here
  111 | class EventGenerator {
      |       ^~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the `GestureMultiFingerScrollWithDelays` function, but failed to spanify one of the call sites, resulting in type mismatch. The call site was not spanified because it is using a `std::array` variable, and the rewriter does not automatically convert `std::array` into `base::span` (because it requires adding .data() and .size()).

## Solution
The rewriter should avoid spanifying functions if spanifying them would require rewriting excluded or complex code, in this case an argument passed to a call site.

## Note
The second error is due to the same root cause as the first error.