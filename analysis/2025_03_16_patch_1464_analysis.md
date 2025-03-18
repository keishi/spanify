# Build Failure Analysis: 2025_03_16_patch_1464

## First error

../../ui/events/test/event_generator.cc:497:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GestureMultiFingerScrollWithDelays` was spanified, but a call site was not updated to use `base::span`. The signature in the header file and the definition in the .cc file do not match after the spanification. The build log shows the mismatch:

```
../../ui/events/test/event_generator.cc:497:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'
  497 | void EventGenerator::GestureMultiFingerScrollWithDelays(
      |                      ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/events/test/event_generator.h:111:7: note: EventGenerator defined here
  111 | class EventGenerator {
      |       ^~~~~~~~~~~~~~
```
The patch only changes the definition and not the declaration.

## Solution
The rewriter needs to spanify both the function declaration and the function definition. The header file must be updated, and all call sites must use `base::span` or provide a compatible object.

## Note
The compiler also complains about not being able to find a matching member function for call to `GestureMultiFingerScrollWithDelays`:

```
../../ui/events/test/event_generator.cc:597:3: error: no matching member function for call to 'GestureMultiFingerScrollWithDelays'
  597 |   GestureMultiFingerScrollWithDelays(
      |   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/events/test/event_generator.h:412:8: note: candidate function not viable: no known conversion from 'std::array<int, kMaxTouchPoints>' to 'const int *' for 5th argument
  412 |   void GestureMultiFingerScrollWithDelays(int count,
      |        ^
  413 |                                           const gfx::Point start[],
  414 |                                           const gfx::Vector2d delta[],
  415 |                                           const int delay_adding_finger_ms[],
  416 |                                           const int delay_releasing_finger_ms[],
      |                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```
This shows that the call site in `EventGenerator::GestureMultiFingerScrollWithDelays` also needs to be updated. The definition at line 581 should match the declaration at line 412. The rewriter spanified the definition but not the declaration. Thus it also failed to update the callsite.