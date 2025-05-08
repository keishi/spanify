# Build Failure Analysis: 2025_05_02_patch_643

## First error

```
../../third_party/blink/renderer/modules/credentialmanagement/credential_manager_type_converters_unittest.cc:302:32: error: member reference base type 'const uint8_t[6]' (aka 'const unsigned char[6]') is not a structure or union
  302 |       arrayBufferOrView(kSample.data(), std::size(kSample)));
      |                         ~~~~~~~^~~~~
```

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter incorrectly added `.data()` to `kSample` which is a C-style array, but was not converted to `std::array`. The `arrayBufferOrView` function expects a `const uint8_t*` as input. `kSample` can be implicitly converted to `const uint8_t*` so adding `.data()` is invalid because `kSample` is not an object with a member named `data`.

## Solution
The rewriter should not add `.data()` to C-style arrays that were not converted to `std::array`. The spanification should be done consistently, and if it's not possible to spanify `kSample`, then `.data()` should not be added.

## Note
The rewriter also modifies the signature of function `vectorOf` to accept `base::span<const uint8_t>`, while the call sites pass C-style array. Rewriter should handle this case to convert C-style array to span correctly.
```diff
-static Vector<uint8_t> vectorOf(const uint8_t* data, size_t size);
+static Vector<uint8_t> vectorOf(base::span<const uint8_t> data, size_t size);
```