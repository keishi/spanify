```
# Build Failure Analysis: 2025_03_15_patch_1429

## First error

../../ui/events/test/event_generator.cc:497:22: error: out-of-line definition of 'GestureMultiFingerScrollWithDelays' does not match any declaration in 'ui::test::EventGenerator'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The reason is that the declaration is in ui/events/test/event_generator.h, while the definition is in ui/events/test/event_generator.cc. Code in ui/events/test/ is excluded. Thus the rewriter spanified the function definition, but not the declaration which caused the compiler to complain.

## Solution
The rewriter needs to avoid spanifying functions if it requires rewriting excluded code.

## Note
The test files were excluded, so we shouldn't have rewritten a function if the definition was inside the test files.