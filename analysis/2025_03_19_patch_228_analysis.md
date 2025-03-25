# Build Failure Analysis: 2025_03_19_patch_228

## First error

../../remoting/test/frame_generator_util.cc:68:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter is spanifying a function, and attempting to construct a `base::span<uint32_t>` from the return value of `frame->GetFrameDataAtPos`.  However, `frame->GetFrameDataAtPos` returns a raw `uint32_t*`, and there is no implicit conversion from a raw pointer to a `base::span`. The rewriter needs to insert code to construct a `base::span` from the raw pointer.

## Solution
The rewriter should insert the necessary code to construct a `base::span` from the raw pointer. Since this code is drawing a rectangle, we can assume that the span's size should match the width. Here is an example of what the code should look like:

```c++
base::span<uint32_t> data = base::span(reinterpret_cast<uint32_t*>(
     frame->GetFrameDataAtPos(webrtc::DesktopVector(rect.left(), y))), rect.width());
```

## Note
The error message includes several candidate constructors, but none matches the `uint32_t *` because an explicit conversion is required.
```
../../remoting/test/frame_generator_util.cc:68:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
   68 |     base::span<uint32_t> data = reinterpret_cast<uint32_t*>(
      |                          ^      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   69 |         frame->GetFrameDataAtPos(webrtc::DesktopVector(rect.left(), y)));
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1032:13: note: candidate constructor not viable: no known conversion from 'uint32_t *' (aka 'unsigned int *') to 'const span<unsigned int> &' for 1st argument
 1032 |   constexpr span(const span& other) noexcept = default;
      |             ^    ~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1042:13: note: candidate constructor not viable: no known conversion from 'uint32_t *' (aka 'unsigned int *') to 'span<unsigned int> &&' for 1st argument
 1042 |   constexpr span(span&& other) noexcept = default;
      |             ^    ~~~~~~~~~~~~
../../base/containers/span.h:998:13: note: candidate template ignored: could not match 'std::type_identity_t<element_type>[N]' (aka 'unsigned int[N]') against 'uint32_t *' (aka 'unsigned int *')
  998 |   constexpr span(
      |             ^
../../base/containers/span.h:1007:13: note: candidate template ignored: constraints not satisfied [with R = uint32_t *]
 1007 |   constexpr span(R&& range)
      |             ^
../../base/containers/span.h:1017:13: note: candidate template ignored: constraints not satisfied [with R = uint32_t *]
 1017 |   constexpr span(R&& range)
      |             ^