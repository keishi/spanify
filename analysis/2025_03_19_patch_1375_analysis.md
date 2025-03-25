# Build Failure Analysis: 2025_03_19_patch_1375

## First error

../../ui/base/text/bytes_formatting.cc:90:34: error: implicit conversion changes signedness: 'int' to 'size_type' (aka 'unsigned long') [-Werror,-Wsign-conversion]

## Category
Rewriter should not introduce implicit sign conversions.

## Reason
The code introduced an implicit conversion from `int` to `size_type` (aka `unsigned long`) in the comparison `bytes >= kUnitThresholds[unit_index]`. The `bytes` variable is of type `int64_t`, while `kUnitThresholds` is an array of `int64_t`. The `unit_index` variable is of type `int`. When `unit_index` is used to access `kUnitThresholds`, the result is implicitly converted to `size_type` when compared with `bytes`.

## Solution
The Rewriter should avoid signed/unsigned implicit conversions. Cast `unit_index` to `int64_t` before comparing.

```c++
   90 |     if (bytes >= kUnitThresholds[unit_index])
      |                  ~~~~~~~~~~~~~~~ ^~~~~~~~~~
```

```c++
   90 |     if (bytes >= kUnitThresholds[static_cast<int64_t>(unit_index)])
      |                  ~~~~~~~~~~~~~~~ ^~~~~~~~~~
```

## Note
There were no other errors in the log.