# Build Failure Analysis: 2025_05_02_patch_18

## First error

../../ui/events/devices/x11/device_data_manager_x11.cc:763:16: error: cannot increment value of type 'base::span<x11::Input::Fp3232>'
  763 |       valuators++;
      |       ~~~~~~~~~^

## Category
Rewriter needs to avoid using pointer arithmetic on spanified variable.

## Reason
The code attempts to increment `valuators`, which is now a `base::span`. `base::span` does not support the `++` operator directly. The original code was performing pointer arithmetic on a raw pointer, which is no longer valid after the spanification.

## Solution
Instead of incrementing the span directly, use `.subspan()` to create a new span with the desired offset. Replace:

```c++
valuators++;
```

with

```c++
valuators = valuators.subspan(1);
```

The loop condition also needs to be updated to use the `size()` method:
```c++
for (int i = 0; i < index; ++i)
```

## Note
The second error also stems from incorrect pointer arithmetic. Rewriter needs to avoid pointer arithmetic on spanified variable.
```c++
../../ui/events/devices/x11/device_data_manager_x11.cc:765:49: error: invalid operands to binary expression ('base::span<x11::Input::Fp3232>' and 'value_type *' (aka 'x11::Input::Fp3232 *'))
  765 |   for (int i = DT_LAST_ENTRY - 1; i > valuators - devev->axisvalues.data();
      |                                       ~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~