# Build Failure Analysis: 2025_05_02_patch_611

## First error

../../media/ffmpeg/ffmpeg_common.cc:766:13: error: no viable conversion from 'int32_t *' (aka 'int *') to 'base::span<const int32_t>' (aka 'span<const int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `VideoTransformation::FromFFmpegDisplayMatrix` was spanified, but the call site in `ffmpeg_common.cc` passes a raw `int32_t*` pointer to it. The rewriter failed to recognize that the `side_data.data()` call returns a raw pointer that must be converted to a `base::span` before being passed to the spanified function.

## Solution
The rewriter needs to correctly identify raw pointers being passed to spanified functions and automatically generate the necessary `base::span` construction code at the call site. In this case, it should generate code like:

```c++
VideoTransformation::FromFFmpegDisplayMatrix(base::span<const int32_t>(reinterpret_cast<int32_t*>(side_data.data()), 9));
```
where `9` is the size of the display matrix (3x3).

## Note
The size `9` may not be available to the rewriter. In that case, this function cannot be spanified.