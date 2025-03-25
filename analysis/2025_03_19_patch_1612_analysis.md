# Build Failure Analysis: 2025_03_19_patch_1612

## First error

../../media/base/video_util_unittest.cc:335:3: error: no matching function for call to 'RotatePlaneByPixels'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `RotatePlaneByPixels`, but failed to spanify the call site in `VideoUtilTest.FrameRotation`. The rewriter needs to recognize that it should rewrite this function call because one of the parameters was rewritten to use `base::span`.

## Solution
Rewrite the call site by wrapping the `src` argument with `base::span`.

For example, the code

```c++
RotatePlaneByPixels(GetParam().src, dest.data(), GetParam().width,
```

should be rewritten to

```c++
RotatePlaneByPixels(base::span(GetParam().src, GetParam().width * GetParam().height), dest.data(), GetParam().width,
```

## Note
There were several additional similar errors, all originating from the same root cause: the function definition `RotatePlaneByPixels` was spanified but the call site was not updated to pass in a span.
```
../../media/base/video_util_unittest.cc:349:3: error: no matching function for call to 'RotatePlaneByPixels'
  349 |   RotatePlaneByPixels(GetParam().src, dest.data(), GetParam().width,
      |   ^~~~~~~~~~~~~~~~~~~
../../media/base/video_util.h:69:19: note: candidate function not viable: no known conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>') for 1st argument
   69 | MEDIA_EXPORT void RotatePlaneByPixels(base::span<const uint8_t> src,
      |                   ^
../../media/base/video_util_unittest.cc:363:3: error: no matching function for call to 'RotatePlaneByPixels'
  363 |   RotatePlaneByPixels(GetParam().src, dest.data(), GetParam().width,
      |   ^~~~~~~~~~~~~~~~~~~
../../media/base/video_util.h:69:19: note: candidate function not viable: no known conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>') for 1st argument
   69 | MEDIA_EXPORT void RotatePlaneByPixels(base::span<const uint8_t> src,