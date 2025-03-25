# Build Failure Analysis: 2025_03_19_patch_1181

## First error

../../third_party/blink/renderer/core/svg/svg_string_list.cc:81:5: error: no matching member function for call to 'ParseInternal'
   81 |     ParseInternal(chars.data(), chars.data() + chars.size(), list_delimiter);
      |     ^~~~~~~~~~~~~

## Category
Rewriter needs to add `.data()` to spanified return value.

## Reason
The function `SVGStringListBase::ParseInternal` was spanified to take a `base::span<const CharType>`, so it expects a span. However, the call site at `svg_string_list.cc:81` is passing `chars.data()` as the first argument, where `chars` is a `base::span<const CharType>`. The `.data()` method on a span returns a raw pointer, which does not match the expected span argument of the function `ParseInternal`.

## Solution
The rewriter should recognize that `chars` is a span and that `.data()` needs to be added to a spanified return value. Then it should add `.data()` to the return value `chars`, generating `ParseInternal(chars, chars.data() + chars.size(), list_delimiter)`. But since the first argument is already spanified, there is no need to pass the `data()` again. Instead, the argument should be `ParseInternal(chars, ...)`

## Note
The second argument `chars.data() + chars.size()` is also incorrect. The rewriter failed to apply subspan rewrite to a spanified return value.