# Build Failure Analysis: 2025_05_02_patch_1875

## First error

../../third_party/blink/renderer/platform/graphics/darkmode/darkmode_classifier.cc:1166:3: error: no matching function for call to 'FullyConnected'
1166 |   FullyConnected<float>(input0_shape, input0,

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FullyConnected` was spanified, but the call site is passing a raw pointer (`input0`) as the `input_values` argument, which now expects a `base::span<const T>`. The rewriter spanified the function declaration but didn't update the call sites to pass a span.

## Solution
The rewriter needs to identify call sites of spanified functions and update them to pass `base::span` objects instead of raw pointers. In this case, it needs to wrap `input0` in a `base::span`. Since the size isn't specified in this case (only a pointer is available), the rewriter needs to create a span using only the pointer.

The rewriter should generate:

```c++
FullyConnected<float>(input0_shape, base::span<const float>(input0),
```

## Note
The size of the span cannot be determined from the available information.