```
# Build Failure Analysis: 2025_03_19_patch_845

## First error

../../ui/events/devices/x11/device_data_manager_x11.cc:801:13: error: invalid operands to binary expression ('x11::Atom *' and 'base::span<x11::Atom>')

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter spanified the return value of `atoms.subspan(DT_LAST_ENTRY)`, but the code is comparing a raw pointer `label` with this spanified return value. Since this is inside an if statement, the rewriter is not considering this as a dereference so it did not add .data() to return value of subspan.

```c++
  x11::Atom* label =
      std::find(atoms.data(), atoms.subspan(DT_LAST_ENTRY).data(),
                valuator_class_info.label);
  if (label == atoms.subspan(DT_LAST_ENTRY)) {
    return DT_LAST_ENTRY;
  }
```

## Solution
The rewriter needs to add `.data()` to the right hand side operand of equality comparison.

## Note
Similar error exist for the second comparison.

```c++
../../ui/events/devices/x11/device_data_manager_x11.cc:804:25: error: invalid operands to binary expression ('x11::Atom *' and 'base::span<x11::Atom>')
  804 |   int data_type = label - atoms;
      |                   ~~~~~ ^ ~~~~~
```
The rewriter needs to add `.data()` to atoms when calculating the difference of raw pointer and the span.