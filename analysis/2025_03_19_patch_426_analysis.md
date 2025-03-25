# Build Failure Analysis: 2025_03_19_patch_426

## First error

../../ui/gtk/printing/print_dialog_gtk.cc:297:34: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter converted `kSettingNamePrefix` to `std::array<char, 6> kSettingNamePrefix{"cups-"};`.
The original code was calling `insert()` and the rewriter should have called `.data()` first.

```c++
-   const std::string setting_name = kSettingNamePrefix + pair.first;
+  const std::string setting_name =
+      kSettingNamePrefix.data().subspan(pair.first);
```

Then on line 297 it attempts to call `subspan()` on the return value of `kSettingNamePrefix.data()`, but failed to add `.data()`.

```
kSettingNamePrefix.data().subspan(pair.first);
```

## Solution
The rewriter needs to add `.data()` when `subspan` is being called.

## Note
There is a second error.
```
../../ui/gtk/printing/print_dialog_gtk.cc:300:40: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  300 |   color_setting_name.insert(0, kSettingNamePrefix.data());
      |                                        ^~~~~~~~~~~~~~~~~~
```
A similar issue occurs where `insert()` was called. The rewriter needs to add `.data()` before `insert()` here.
```c++
-  color_setting_name.insert(0, kSettingNamePrefix);
+  color_setting_name.insert(0, kSettingNamePrefix.data());
```