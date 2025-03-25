# Build Failure Analysis: 2025_03_19_patch_321

## First error

../../media/base/audio_bus_unittest.cc:646:56: error: invalid operands to binary expression ('const std::array<float, kTestVectorSize>' and 'size_t' (aka 'unsigned long'))

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter spanified `kTestVectorFloat32` and then failed to add `.data()` to it when doing pointer arithmetic.

## Solution
Rewrite pointer arithmetic on spanified array names to use `.data()` like this:
```
-                   kTestVectorFloat32 +
+                   kTestVectorFloat32.data() +
```

## Note
There was another error of similar reason later in the log.