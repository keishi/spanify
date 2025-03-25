# Build Failure Analysis: 2025_03_19_patch_750

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 15273, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15279, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first adds the `.data()` call to access the underlying pointer of the `std::array`, and then it tries to rewrite `sizeof` to use `.size()`. Since the `sizeof` rewrite includes the array name, this leads to overlapping replacements. The conflict happens because the `.data()` is inserted inside the range that RewriteArraySizeof wants to rewrite.

## Solution
The rewriter needs to avoid generating overlapping replacements by carefully considering the order in which replacements are applied or by adjusting the ranges of the replacements. Also, consider collapsing multiple rewrites into a single rewrite when possible.

## Note
The overlapping replacements can be verified from the diff:
```diff
-    config->extra_data.assign(kIAD, kIAD + sizeof(kIAD));
+    config->extra_data.assign(kIAD.data(), base::span<const uint8_t>(kIAD ).subspan( sizeof).data()(kIAD));
```
Here kIAD is rewritten to `kIAD.data()` and then there's a conflicting replacement that tries to use `kIAD` in the size calculation.
```
offset 15273, length 12: "(kIAD.size() * sizeof(decltype(kIAD)::value_type))" and offset 15279, length 0: ".data()"