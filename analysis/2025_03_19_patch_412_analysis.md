# Build Failure Analysis: 2025_03_19_patch_412

## First error

../../third_party/blink/renderer/modules/webaudio/oscillator_handler.cc:443:19: error: no matching member function for call to 'WaveDataForFundamentalFrequency'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `OscillatorHandler::WaveDataForFundamentalFrequency`, but failed to spanify the call site in `OscillatorHandler::ProcessKRateScalar`. `OscillatorHandler::ProcessKRateScalar` passes a `base::span` where a raw pointer is expected in the `WaveDataForFundamentalFrequency` function.

## Solution
The rewriter needs to spanify the call sites for spanified functions. The rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.

## Note
The second error was the same as the first, just a different line number.