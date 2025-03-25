# Build Failure Analysis: 2025_03_19_patch_462

## First error

../../third_party/blink/renderer/core/css/resolver/cascade_map.h:160:14: error: no viable conversion from returned value of type 'CascadePriorityList *' to function return type 'base::span<CascadePriorityList>'

## Category
Rewriter failed to add .data() to a spanified return value.

## Reason
`CascadePriorityList* Buffer()` was spanified, but the rewriter failed to add `.data()` to the return value.

## Solution
The rewriter needs to add `.data()` to the return value, so that it will return `base::span<CascadePriorityList>`.

For example:
```diff
--- a/third_party/blink/renderer/core/css/resolver/cascade_map.h
+++ b/third_party/blink/renderer/core/css/resolver/cascade_map.h
@@ -157,7 +157,7 @@
     const CSSBitset& Bits() const { return bits_; }
  
-    CascadePriorityList* Buffer() {
+    base::span<CascadePriorityList> Buffer() {
        return reinterpret_cast<CascadePriorityList*>(properties_);
     }
```

should be:

```diff
--- a/third_party/blink/renderer/core/css/resolver/cascade_map.h
+++ b/third_party/blink/renderer/core/css/resolver/cascade_map.h
@@ -157,7 +157,7 @@
     const CSSBitset& Bits() const { return bits_; }
  
-    CascadePriorityList* Buffer() {
+    base::span<CascadePriorityList> Buffer() {
        return reinterpret_cast<CascadePriorityList*>(properties_).data();
     }