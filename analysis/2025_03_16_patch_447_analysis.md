# Build Failure Analysis: 2025_03_16_patch_447

## First error

../../third_party/blink/renderer/core/css/resolver/cascade_map.h:160:14: error: no viable conversion from returned value of type 'CascadePriorityList *' to function return type 'base::span<CascadePriorityList>'

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to implicitly convert a raw pointer `CascadePriorityList*` to a `base::span<CascadePriorityList>`.  The compiler error indicates that there's no viable conversion between these types. The rewriter is not constructing the span correctly in this case, and needs to create an explicit `span` object, but the size is implicit here.

## Solution
The rewriter must generate code to explicitly construct a `base::span` from the raw pointer and a size if known. If the size is unknown (e.g. the pointer is a return value from a function), then it may not be safe to automatically convert to `base::span` unless there's a way to determine the size. A more robust solution is to create a span using the pointer and the number of elements. Since the size isn't known, we cannot do that. The best solution is to skip the conversion.

## Note
Multiple files are failing to compile for the same reason.