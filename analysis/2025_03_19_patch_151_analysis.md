# Build Failure Analysis: 2025_03_19_patch_151

## First error

../../media/formats/mp4/box_definitions.cc:313:48: error: invalid operands to binary expression ('std::array<uint8_t, kInitializationVectorSize>' (aka 'array<unsigned char, kInitializationVectorSize>') and 'uint8_t' (aka 'unsigned char'))

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter converted a raw pointer to `std::array`. The `memcpy` in question is adding an offset to the `initialization_vector` and using it as a pointer. After the rewrite, `initialization_vector` is of type `std::array`, which doesn't support pointer arithmetic with the `+` operator. 

## Solution
Instead of using pointer arithmetic, `initialization_vector[i]` can be used, and this will work with `std::array`.

```
-    RCHECK(reader->Read1(initialization_vector + i));
+    RCHECK(reader->Read1(&initialization_vector[i]));
```

## Note
TrackRunIterator::ApplyConstantIv is doing similar things as well, but it didn't cause a compile error. Likely it is because there are other implicit casts occurring that satisfies the expression.