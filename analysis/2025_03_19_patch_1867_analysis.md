# Build Failure Analysis: 2025_03_19_patch_1867

## First error

../../ui/base/resource/resource_bundle.cc:174:41: error: reinterpret_cast from 'std::string_view' (aka 'basic_string_view<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code attempts to reinterpret_cast a `std::string_view` to a `const uint8_t*`, and then uses that result to construct a `base::span<const uint8_t>`. The rewriter spanified the `std::string_view` but left the `reinterpret_cast` in place, which is invalid because you cannot reinterpret_cast a span. The correct way to achieve this conversion is to add `.data()` to the spanified variable.

## Solution
The rewriter should remove the `reinterpret_cast` and add `.data()` to the `input` variable.

```diff
-  base::span<const uint8_t> raw_input = reinterpret_cast<const uint8_t*>(input);
+  base::span<const uint8_t> raw_input = input.data();
```

## Note
The second error message shows that `.data()` is missing when calling BrotliDecoderDecompress:

```
../../ui/base/resource/resource_bundle.cc:177:14: error: no viable conversion from 'base::span<const uint8_t>' (aka 'span<const unsigned char>') to 'const uint8_t *' (aka 'const unsigned char *')
   177 |              input.size() - ResourceBundle::kBrotliHeaderSize, raw_input.data(),
       |              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^~~~~~~~~~~~~~~~
```

This is a follow up error from the first error. After fixing the first error, the rewriter needs to add `.data()` to `raw_input` variable. I'm not adding this as a category because this kind of error is already handled by the rewriter and has a category for it.
```diff
-             input.size() - ResourceBundle::kBrotliHeaderSize, raw_input.data(),
+             input.size() - ResourceBundle::kBrotliHeaderSize, raw_input.data().data(),