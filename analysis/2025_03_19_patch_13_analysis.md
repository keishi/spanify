# Build Failure Analysis: 2025_03_19_patch_13

## First error

../../third_party/blink/renderer/platform/mojo/string16_mojom_traits.h:37:52: error: no viable conversion from returned value of type 'const span<const uint16_t>' to function return type 'const span<uint16_t>'

## Category
Rewriter failed to handle const qualifier when spanifying a member.

## Reason
The rewriter transformed `const uint16_t* data() const` to `const base::span<uint16_t> data() const`. However, the return type of the `data()` function needs to be `base::span<const uint16_t>`, because the `unowned_` member being returned is of type `base::span<const uint16_t>`. The error message indicates that there is no viable conversion from `base::span<const uint16_t>` to `base::span<uint16_t>`.

## Solution
The rewriter should transform `const uint16_t* data() const` to `base::span<const uint16_t> data() const`. The const qualifier must be preserved when rewriting the return type.

## Note
The second error in the build log is a consequence of the first error, where `input.data()` returns the wrong type.
```
../../third_party/blink/renderer/platform/mojo/string16_mojom_traits.h:55:12: error: no viable conversion from returned value of type 'const base::span<uint16_t>' (aka 'const span<unsigned short>') to function return type 'const Element *' (aka 'const unsigned short *')
   55 |     return input.data();