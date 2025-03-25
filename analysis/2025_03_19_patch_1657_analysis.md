# Build Failure Analysis: 2025_03_19_patch_1657

## First error

../../ui/events/devices/x11/device_data_manager_x11.cc:592:14: error: cannot increment value of type 'base::span<const x11::Input::Fp3232>'

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the `valuators` variable, but failed to rewrite the increment `valuators++`. Because the old code was operating on a raw pointer, the increment was valid. However, after spanification, the increment becomes invalid because span is not incrementable.

## Solution
The rewriter should have used the index into `valuators` rather than incrementing the `valuators` variable itself.

```
-    valuators++;
+    valuator_index++;
```
Also need to initialize a new variable with the index:
```
+  size_t valuator_index = 0;
```
And modify the line where `valuator` is being assigned to use `valuator_index`:
```
-    auto valuator = Fp3232ToDouble(*valuators);
+    auto valuator = Fp3232ToDouble(valuators[valuator_index]);
```
Finally, also need to declare `horizontal_number` and `vertical_number` at the beginning of the function as well.