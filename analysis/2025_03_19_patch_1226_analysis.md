# Build Failure Analysis: 2025_03_19_patch_1226

## First error

../../net/base/ip_address.h:65:39: error: no viable conversion from returned value of type 'base::span<uint8_t>' (aka 'span<unsigned char>') to function return type 'uint8_t *' (aka 'unsigned char *')
  65 |   constexpr uint8_t* begin() { return data(); }
      |                                       ^~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified `data()` but failed to add `.data()` to a spanified return value.

## Solution
Rewriter needs to add `.data()` to a spanified return value.

```
--- a/net/base/ip_address.h
+++ b/net/base/ip_address.h
@@ -65,7 +65,7 @@
 
   // Returns a pointer to the first element.
   constexpr const uint8_t* begin() const { return data(); }
-  constexpr uint8_t* begin() { return data(); }
+  constexpr uint8_t* begin() { return data().data(); }
   // Returns a pointer to one past the last element.
   constexpr const uint8_t* end() const { return data() + size_; }
   constexpr uint8_t* end() { return UNSAFE_TODO(data() + size_); }