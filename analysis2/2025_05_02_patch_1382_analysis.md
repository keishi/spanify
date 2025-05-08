# Build Failure Analysis: 2025_05_02_patch_1382

## First error

../../ui/gfx/x/xproto_types.h:191:31: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter failed to handle cast of single variable span.

## Reason
The rewriter added conversion for single variable span, but not its cast.

```
-  const uint8_t* start = reinterpret_cast<const uint8_t*>(t);
+  base::span<const uint8_t> start = reinterpret_cast<const uint8_t*>(t);
```

Needs to be 

```
-  const uint8_t* start = reinterpret_cast<const uint8_t*>(t);
+  base::span<const uint8_t> start = reinterpret_cast<const uint8_t*>(base::span<const T, 1>(t));
```

## Solution
Rewriter should be able to identify this single variable span and wrap it with `base::span<const T, 1>()`

## Note
There is a secondary error as well. The rewriter also created an invalid expression `start.subspan(sizeof).data()(t[0])`. This is a conflict between ".data()" and ".subspan()" replacements.
```
-    std::copy(start, start + sizeof(*t), std::back_inserter(current_buffer_));
+    std::copy(start.data(), start.subspan(sizeof).data()(t[0]),
+              std::back_inserter(current_buffer_));