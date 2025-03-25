# Build Failure Analysis: 2025_03_19_patch_957

## First error

../../ui/events/test/event_generator.cc:497:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'

## Category
Pointer passed into spanified function parameter.

## Reason
The function signature in the .cc file does not match the function signature in the header file after the rewriter has been applied. The rewriter changed the type of `delta` parameter from `const gfx::Vector2d delta[]` to `base::span<const gfx::Vector2d> delta` in the header file, but the corresponding definition in the .cc file was not updated. This mismatch causes the compiler to report an error because the signatures of the declaration and the definition no longer align.

## Solution
The rewriter needs to ensure that when it spanifies a function, it spanifies both the function declaration and the function definition at the same time. So in ui/events/test/event_generator.cc, change the function definition to the following:

```c++
void EventGenerator::GestureMultiFingerScrollWithDelays(
    int count,
    const gfx::Point start[],
    base::span<const gfx::Vector2d> delta,
    const int delay_adding_finger_ms[],
    const int delay_releasing_finger_ms[],
    int event_separation_time_ms,
    int scroll_end_time_ms,
    int steps) {
```

## Note
The second error is a consequence of the first error, and will be automatically fixed after the fix above has been applied.