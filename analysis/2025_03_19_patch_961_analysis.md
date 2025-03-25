# Build Failure Analysis: 2025_03_19_patch_961

## First error

../../ui/events/test/event_generator.cc:495:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'
  495 | void EventGenerator::GestureMultiFingerScrollWithDelays(
      |                      ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/events/test/event_generator.h:111:7: note: EventGenerator defined here
  111 | class EventGenerator {
      |       ^~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function in the header file but failed to spanify the out-of-line definition of the function in the cc file, leading to a mismatch in the function signature.

## Solution
The rewriter must consistently spanify both the function declaration and its out-of-line definition. This likely requires updating the rewriter logic to identify and modify the corresponding out-of-line definitions when a function declaration is spanified.

```diff
--- a/ui/events/test/event_generator.cc
+++ b/ui/events/test/event_generator.cc
@@ -491,11 +491,11 @@ void EventGenerator::GestureMultiFingerScrollWithDelays(
     int count,
     const gfx::Point start[],
     const gfx::Vector2d delta[],
-    const int delay_adding_finger_ms[],
+    base::span<const int> delay_adding_finger_ms,
     const int delay_releasing_finger_ms[],
     int event_separation_time_ms,
     int steps) {
-  DCHECK_EQ(count, static_cast<int>(std::size(start)));
+  DCHECK_EQ(count, static_cast<int>(start.size()));
   DCHECK_EQ(count, static_cast<int>(std::size(delta)));
   DCHECK_EQ(count, static_cast<int>(std::size(delay_adding_finger_ms)));
   DCHECK_EQ(count, static_cast<int>(std::size(delay_releasing_finger_ms)));
@@ -575,7 +575,7 @@ void EventGenerator::GestureMultiFingerScrollWithDelays(
 void EventGenerator::GestureMultiFingerScrollWithDelays(
     int count,
     const gfx::Point start[],
-    const int delay_adding_finger_ms[],
+    base::span<const int> delay_adding_finger_ms,
     int event_separation_time_ms,
     int steps,
     int move_x,

```

## Note
The build log shows multiple errors stemming from this single root cause. In addition, the use of `std::size(start)` triggers a crash in the test.