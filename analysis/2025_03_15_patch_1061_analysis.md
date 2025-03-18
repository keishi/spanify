```
# Build Failure Analysis: 2025_03_15_patch_1061

## First error

../../device/fido/cable/v2_handshake.cc:541:36: error: no matching conversion for functional-style cast from 'uint64_t *' (aka 'unsigned long *') to 'base::span<uint64_t, 1>' (aka 'span<unsigned long, 1>')

## Category
Rewriter needs to generate code to construct a span from a pointer.

## Reason
The rewriter is attempting to create a `base::span<uint64_t, 1>` from `&v` using a functional-style cast, but there is no viable constructor available to perform that cast implicitly. The available constructors either expect a C-style array or iterators. Additionally, it is attempting to `reinterpret_cast` the `base::span<uint64_t, 1>` to `uint8_t*`, which is not allowed.

## Solution
The rewriter should generate `base::span<const uint8_t>(reinterpret_cast<const uint8_t*>(&v), sizeof(v))` instead of `reinterpret_cast<uint8_t*>(base::span<uint64_t, 1>(&v))`.

```diff
diff --git a/device/fido/cable/v2_handshake.cc b/device/fido/cable/v2_handshake.cc
index bd8f95958ad72..dfe46c7d91fd 100644
--- a/device/fido/cable/v2_handshake.cc
+++ b/device/fido/cable/v2_handshake.cc
@@ -2,6 +8,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/containers/span.h"
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/351564777): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -535,8 +537,10 @@ std::optional<std::vector<uint8_t>> DigitsToBytes(std::string_view in) {
       return std::nullopt;
     }
 
-    const uint8_t* const v_bytes = reinterpret_cast<uint8_t*>(&v);
-    ret.insert(ret.end(), v_bytes, v_bytes + remaining_bytes);
+    const base::span<const uint8_t> v_bytes =
+        base::span<const uint8_t>(reinterpret_cast<const uint8_t*>(&v), sizeof(v));
+    ret.insert(ret.end(), v_bytes.data(),
+               v_bytes.subspan(remaining_bytes).data());
   }
 
   return ret;
```

## Note
There are other errors in the log as well. The immediate error is that the span type being constructed is not valid, but even if that was fixed, using reinterpret_cast from span is not valid. It should be just span wrapping the pointer. Also needs to pass the size to the created span.