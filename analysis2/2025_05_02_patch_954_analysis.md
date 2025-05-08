# Build Failure Analysis: 2025_05_02_patch_954

## First error

../../dbus/message_unittest.cc:263:39: error: cannot initialize a parameter of type 'const int32_t **' (aka 'const int **') with an rvalue of type 'base::span<const int32_t> *' (aka 'span<const int> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The `PopArrayOfInt32s` function in `dbus/message.h` expects a `const int32_t**` as an argument, but the rewriter spanified `output_int32s` to `base::span<const int32_t>`. The code is passing the address of a `base::span<const int32_t>` to a function expecting the address of a `const int32_t*`. The function definition in `dbus/message.h` was not modified by the spanify tool to accept a span.

## Solution
The rewriter should spanify the `PopArrayOfInt32s` function in `dbus/message.h` and all call sites if possible. If spanifying the function is not possible, then the call site needs to be modified to create a raw pointer from the span. The current rewriter only modifies local variables but does not update function parameters.

## Note
N/A