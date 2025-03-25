# Build Failure Analysis: 111

## First error

../../chrome/browser/ui/omnibox/omnibox_view_browsertest.cc:243:41: error: cannot increment value of type 'base::span<const ui::KeyboardCode>'
  243 |     for (; keys[0] != ui::VKEY_UNKNOWN; ++keys) {
      |                                         ^ ~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The loop `for (; keys[0] != ui::VKEY_UNKNOWN; ++keys)` is attempting to increment the `keys` variable directly, which is now a `base::span`. A `base::span` cannot be incremented directly like a pointer. It needs to be advanced using `.subspan()`.

## Solution
The rewriter should have rewritten the increment operation `++keys` to use `keys = keys.subspan(1);`.

```c++
-  void SendKeySequence(base::span<const ui::KeyboardCode> keys) {
-    for (; *keys != ui::VKEY_UNKNOWN; ++keys) {
+  void SendKeySequence(base::span<const ui::KeyboardCode> keys) {
+    for (; keys[0] != ui::VKEY_UNKNOWN; keys = keys.subspan(1)) {
       ASSERT_NO_FATAL_FAILURE(SendKey(*keys, 0));
     }
   }
```

## Note
A secondary error was also present, related to the dereferencing. This is likely a conflict between the ".data()" and ".subspan()" replacements.
```
../../chrome/browser/ui/omnibox/omnibox_view_browsertest.cc:244:39: error: indirection requires pointer operand ('base::span<const ui::KeyboardCode>' invalid)
  244 |       ASSERT_NO_FATAL_FAILURE(SendKey(*keys, 0));
      |                                       ^~~~~