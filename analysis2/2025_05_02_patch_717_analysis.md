# Build Failure Analysis: 2025_05_02_patch_717

## First error

../../ui/events/keycodes/dom/keycode_converter.cc:164:10: error: no viable conversion from returned value of type 'const KeycodeMapEntry[246]' to function return type 'const base::span<KeycodeMapEntry>'

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `GetKeycodeMapForTest` is returning `kDomCodeMappings`, which is a C-style array. The function's return type has been changed to `base::span<KeycodeMapEntry>`. The rewriter needs to generate code to construct a span from the C-style array `kDomCodeMappings`.

## Solution
The rewriter should generate a `base::span` from the `kDomCodeMappings` array when it is returned.
```c++
return base::span<KeycodeMapEntry>(kDomCodeMappings);
```

## Note
None